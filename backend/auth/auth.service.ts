import {
    BadRequestException,
    ConflictException,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    OnModuleInit,
    ServiceUnavailableException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service.js";
import { MailService } from "./mail.service.js";
import type {
    LoginDto,
    RegisterDto,
    ResetPasswordDto,
    VerifyEmailDto,
} from "./auth.dto.js";

type UserRow = {
    id: string;
    email: string;
    username: string;
    email_verified: number;
    password_hash: string;
    display_name: string;
    status: string;
    created_at: string;
};
export type SafeUser = {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[];
    createdAt: string;
};

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @Inject(DatabaseService) private readonly db: DatabaseService,
        @Inject(JwtService) private readonly jwt: JwtService,
        @Inject(MailService) private readonly mail: MailService,
    ) {}

    async onModuleInit() {
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password || password.length < 8) return;
        let row = this.db.connection
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email) as { id: string } | undefined;
        if (!row) {
            const id = randomUUID();
            const timestamp = new Date().toISOString();
            const hash = await bcrypt.hash(password, 12);
            this.db.connection
                .prepare(
                    "INSERT INTO users (id,email,username,email_verified,password_hash,display_name,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
                )
                .run(
                    id,
                    email,
                    "admin",
                    1,
                    hash,
                    process.env.ADMIN_NAME?.trim() || "Jeju Admin",
                    timestamp,
                    timestamp,
                );
            row = { id };
        }
        this.db.connection
            .prepare(
                "INSERT OR IGNORE INTO user_roles (user_id,role_id,assigned_at) VALUES (?,'role-admin',?)",
            )
            .run(row.id, new Date().toISOString());
    }

    async register(input: RegisterDto) {
        const email = input.email.trim().toLowerCase();
        const username = input.username.trim().toLowerCase();
        const exists = this.db.connection
            .prepare(
                "SELECT email,username FROM users WHERE email = ? OR username = ?",
            )
            .get(email, username) as
            | { email: string; username: string }
            | undefined;
        if (exists?.email.toLowerCase() === email)
            throw new ConflictException("This email is already in use.");
        if (exists)
            throw new ConflictException("This username is already in use.");
        const id = randomUUID();
        const timestamp = new Date().toISOString();
        const passwordHash = await bcrypt.hash(input.password, 12);
        const transaction = this.db.connection.transaction(() => {
            this.db.connection
                .prepare(
                    "INSERT INTO users (id,email,username,email_verified,password_hash,display_name,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
                )
                .run(
                    id,
                    email,
                    username,
                    0,
                    passwordHash,
                    input.displayName.trim(),
                    timestamp,
                    timestamp,
                );
            this.db.connection
                .prepare(
                    "INSERT INTO user_roles (user_id,role_id,assigned_at) VALUES (?,'role-member',?)",
                )
                .run(id, timestamp);
        });
        transaction();
        try {
            const delivery = await this.issueVerificationCode(
                id,
                email,
                input.displayName.trim(),
                false,
            );
            return {
                verificationRequired: true,
                email,
                expiresInSeconds: 600,
                devCode: delivery.devCode,
            };
        } catch (error) {
            this.db.connection.prepare("DELETE FROM users WHERE id=?").run(id);
            const detail =
                error instanceof Error ? error.message : "Unknown email error";
            console.error("[EMAIL] Verification email failed:", detail);
            throw new ServiceUnavailableException(
                process.env.NODE_ENV === "production"
                    ? "Unable to send the verification email. Check the email service configuration and try again."
                    : `Unable to send the verification email: ${detail}`,
                { cause: error },
            );
        }
    }

    async login(input: LoginDto) {
        const username = input.username.trim().toLowerCase();
        const row = this.db.connection
            .prepare("SELECT * FROM users WHERE username = ? AND status = ?")
            .get(username, "ACTIVE") as UserRow | undefined;
        if (!row || !(await bcrypt.compare(input.password, row.password_hash)))
            throw new UnauthorizedException(
                "Incorrect username or password.",
            );
        if (!row.email_verified)
            throw new UnauthorizedException(
                "Email is not verified. Complete registration or request a new code.",
            );
        const user = this.findSafeUser(row.id);
        return { user, token: this.sign(user) };
    }

    async verifyEmail(input: VerifyEmailDto) {
        const email = input.email.trim().toLowerCase();
        const user = this.db.connection
            .prepare("SELECT * FROM users WHERE email=?")
            .get(email) as UserRow | undefined;
        if (!user)
            throw new BadRequestException(
                "The verification code is invalid or expired.",
            );
        if (user.email_verified) {
            const safe = this.findSafeUser(user.id);
            return { user: safe, token: this.sign(safe) };
        }
        const record = this.db.connection
            .prepare("SELECT * FROM email_verification_codes WHERE user_id=?")
            .get(user.id) as
            | { code_hash: string; expires_at: string; attempts: number }
            | undefined;
        if (!record || new Date(record.expires_at).getTime() < Date.now())
            throw new BadRequestException(
                "The verification code has expired. Request a new code.",
            );
        if (record.attempts >= 5)
            throw new HttpException(
                "Too many incorrect attempts. Request a new code.",
                HttpStatus.TOO_MANY_REQUESTS,
            );
        if (this.hashCode(input.code) !== record.code_hash) {
            this.db.connection
                .prepare(
                    "UPDATE email_verification_codes SET attempts=attempts+1 WHERE user_id=?",
                )
                .run(user.id);
            throw new BadRequestException("Incorrect verification code.");
        }
        this.db.connection.transaction(() => {
            this.db.connection
                .prepare(
                    "UPDATE users SET email_verified=1,updated_at=? WHERE id=?",
                )
                .run(new Date().toISOString(), user.id);
            this.db.connection
                .prepare("DELETE FROM email_verification_codes WHERE user_id=?")
                .run(user.id);
        })();
        const safe = this.findSafeUser(user.id);
        return { user: safe, token: this.sign(safe) };
    }

    async resendVerification(emailInput: string) {
        const email = emailInput.trim().toLowerCase();
        const user = this.db.connection
            .prepare("SELECT * FROM users WHERE email=?")
            .get(email) as UserRow | undefined;
        if (!user) return { ok: true, email, expiresInSeconds: 600 };
        if (user.email_verified)
            throw new BadRequestException(
                "This email is already verified. You can sign in.",
            );
        const delivery = await this.issueVerificationCode(
            user.id,
            email,
            user.display_name,
            true,
        );
        return {
            ok: true,
            email,
            expiresInSeconds: 600,
            devCode: delivery.devCode,
        };
    }

    async requestPasswordReset(emailInput: string) {
        const email = emailInput.trim().toLowerCase();
        const user = this.db.connection
            .prepare("SELECT * FROM users WHERE email=? AND email_verified=1")
            .get(email) as UserRow | undefined;
        if (!user) return { ok: true, email, expiresInSeconds: 600 };
        const existing = this.db.connection
            .prepare(
                "SELECT last_sent_at FROM password_reset_codes WHERE user_id=?",
            )
            .get(user.id) as { last_sent_at: string } | undefined;
        if (
            existing &&
            Date.now() - new Date(existing.last_sent_at).getTime() < 60_000
        )
            throw new HttpException(
                "Wait 60 seconds before requesting another code.",
                HttpStatus.TOO_MANY_REQUESTS,
            );
        const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
        const sentAt = new Date();
        const expiresAt = new Date(sentAt.getTime() + 10 * 60_000);
        this.db.connection
            .prepare(
                `INSERT INTO password_reset_codes(user_id,code_hash,expires_at,attempts,last_sent_at,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,last_sent_at=excluded.last_sent_at`,
            )
            .run(
                user.id,
                this.hashCode(code),
                expiresAt.toISOString(),
                0,
                sentAt.toISOString(),
                sentAt.toISOString(),
            );
        const delivery = await this.mail.sendPasswordResetCode(
            email,
            user.display_name,
            code,
        );
        return {
            ok: true,
            email,
            expiresInSeconds: 600,
            devCode: delivery.devCode,
        };
    }

    async resetPassword(input: ResetPasswordDto) {
        const email = input.email.trim().toLowerCase();
        const user = this.db.connection
            .prepare("SELECT * FROM users WHERE email=? AND email_verified=1")
            .get(email) as UserRow | undefined;
        if (!user)
            throw new BadRequestException(
                "The reset code is invalid or expired.",
            );
        const record = this.db.connection
            .prepare("SELECT * FROM password_reset_codes WHERE user_id=?")
            .get(user.id) as
            | { code_hash: string; expires_at: string; attempts: number }
            | undefined;
        if (!record || new Date(record.expires_at).getTime() < Date.now())
            throw new BadRequestException(
                "The reset code has expired. Request a new code.",
            );
        if (record.attempts >= 5)
            throw new HttpException(
                "Too many incorrect attempts. Request a new code.",
                HttpStatus.TOO_MANY_REQUESTS,
            );
        if (this.hashCode(input.code) !== record.code_hash) {
            this.db.connection
                .prepare(
                    "UPDATE password_reset_codes SET attempts=attempts+1 WHERE user_id=?",
                )
                .run(user.id);
            throw new BadRequestException("Incorrect reset code.");
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        this.db.connection.transaction(() => {
            this.db.connection
                .prepare(
                    "UPDATE users SET password_hash=?,updated_at=? WHERE id=?",
                )
                .run(passwordHash, new Date().toISOString(), user.id);
            this.db.connection
                .prepare("DELETE FROM password_reset_codes WHERE user_id=?")
                .run(user.id);
        })();
        return { ok: true, username: user.username };
    }

    verify(token: string) {
        try {
            return this.findSafeUser(
                this.jwt.verify<{ sub: string }>(token).sub,
            );
        } catch {
            throw new UnauthorizedException(
                "The session is invalid or expired.",
            );
        }
    }
    private sign(user: SafeUser) {
        return this.jwt.sign({
            sub: user.id,
            email: user.email,
            roles: user.roles,
        });
    }
    private findSafeUser(id: string): SafeUser {
        const row = this.db.connection
            .prepare("SELECT * FROM users WHERE id = ?")
            .get(id) as UserRow | undefined;
        if (!row) throw new UnauthorizedException("Account not found.");
        if (row.status !== "ACTIVE")
            throw new UnauthorizedException(
                "This account has been deactivated. Contact an administrator.",
            );
        const roles = this.db.connection
            .prepare(
                "SELECT r.code FROM roles r JOIN user_roles ur ON ur.role_id=r.id WHERE ur.user_id=?",
            )
            .all(id) as { code: string }[];
        if (!row.email_verified)
            throw new UnauthorizedException("Email is not verified.");
        return {
            id: row.id,
            email: row.email,
            username: row.username,
            displayName: row.display_name,
            roles: roles.map((role) => role.code),
            createdAt: row.created_at,
        };
    }
    private async issueVerificationCode(
        userId: string,
        email: string,
        displayName: string,
        enforceCooldown: boolean,
    ) {
        const existing = this.db.connection
            .prepare(
                "SELECT last_sent_at FROM email_verification_codes WHERE user_id=?",
            )
            .get(userId) as { last_sent_at: string } | undefined;
        if (
            enforceCooldown &&
            existing &&
            Date.now() - new Date(existing.last_sent_at).getTime() < 60_000
        )
            throw new HttpException(
                "Wait 60 seconds before requesting another code.",
                HttpStatus.TOO_MANY_REQUESTS,
            );
        const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
        const sentAt = new Date();
        const expiresAt = new Date(sentAt.getTime() + 10 * 60_000);
        this.db.connection
            .prepare(
                `INSERT INTO email_verification_codes(user_id,code_hash,expires_at,attempts,last_sent_at,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,last_sent_at=excluded.last_sent_at`,
            )
            .run(
                userId,
                this.hashCode(code),
                expiresAt.toISOString(),
                0,
                sentAt.toISOString(),
                sentAt.toISOString(),
            );
        return this.mail.sendVerificationCode(email, displayName, code);
    }
    private hashCode(code: string) {
        return createHash("sha256")
            .update(
                `${code}:${process.env.JWT_SECRET || "development-only-change-me"}`,
            )
            .digest("hex");
    }
}
