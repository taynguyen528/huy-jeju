import { Injectable } from "@nestjs/common";

type EmailMessage = { to: string; subject: string; text: string; html: string };
type EmailProvider = "console" | "brevo" | "resend";

@Injectable()
export class MailService {
    private readonly provider =
        (process.env.EMAIL_PROVIDER?.trim().toLowerCase() ||
            (process.env.NODE_ENV === "production"
                ? "brevo"
                : "console")) as EmailProvider;

    constructor() {
        console.log(
            `[EMAIL] provider=${this.provider}, configured=${this.isConfigured()}`,
        );
    }

    async sendVerificationCode(
        email: string,
        displayName: string,
        code: string,
    ) {
        if (this.provider === "console")
            return this.developmentFallback("verification", email, code);
        const safeName = this.escapeHtml(displayName);
        await this.send({
            to: email,
            subject: "Verify your Jeju account",
            text: `Hello ${displayName}, your Jeju account verification code is ${code}. It expires in 10 minutes.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="margin:0 0 18px">Verify your Jeju account</h1><p>Hello <strong>${safeName}</strong>,</p><p>Enter the code below to complete registration:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">The code expires in 10 minutes. Do not share it with anyone.</p></div>`,
        });
        return { delivered: true, devCode: undefined };
    }

    async sendPasswordResetCode(
        email: string,
        displayName: string,
        code: string,
    ) {
        if (this.provider === "console")
            return this.developmentFallback("password reset", email, code);
        const safeName = this.escapeHtml(displayName);
        await this.send({
            to: email,
            subject: "Reset your Jeju password",
            text: `Hello ${displayName}, your password reset code is ${code}. It expires in 10 minutes.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1>Reset your Jeju password</h1><p>Hello <strong>${safeName}</strong>,</p><p>Your password reset code is:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">The code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`,
        });
        return { delivered: true, devCode: undefined };
    }

    private async send(email: EmailMessage) {
        if (this.provider === "brevo") return this.sendWithBrevo(email);
        if (this.provider === "resend") return this.sendWithResend(email);
        throw new Error(
            `Invalid EMAIL_PROVIDER: "${this.provider}". Supported values are "console", "brevo", and "resend".`,
        );
    }

    private async sendWithBrevo(email: EmailMessage) {
        const apiKey = process.env.BREVO_API_KEY?.trim();
        const senderEmail = process.env.BREVO_FROM_EMAIL?.trim().toLowerCase();
        const senderName = process.env.BREVO_FROM_NAME?.trim() || "Jeju";
        if (!apiKey) throw new Error("BREVO_API_KEY is not configured.");
        if (!senderEmail) throw new Error("BREVO_FROM_EMAIL is not configured.");
        await this.request("Brevo", "https://api.brevo.com/v3/smtp/email", {
            headers: { "api-key": apiKey },
            body: {
                sender: { name: senderName, email: senderEmail },
                to: [{ email: email.to.toLowerCase() }],
                subject: email.subject,
                textContent: email.text,
                htmlContent: email.html,
            },
        });
    }

    private async sendWithResend(email: EmailMessage) {
        const apiKey = process.env.RESEND_API_KEY?.trim();
        const sender =
            process.env.RESEND_FROM?.trim() || "Jeju <onboarding@resend.dev>";
        if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
        if (/@(yourdomain\.com|example\.com)>?$/i.test(sender))
            throw new Error(
                "RESEND_FROM still uses a placeholder domain. Use onboarding@resend.dev for testing or a verified Resend domain.",
            );
        await this.request("Resend", "https://api.resend.com/emails", {
            headers: { Authorization: `Bearer ${apiKey}` },
            body: {
                from: sender,
                to: [email.to.toLowerCase()],
                subject: email.subject,
                text: email.text,
                html: email.html,
            },
        });
    }

    private async request(
        provider: "Brevo" | "Resend",
        url: string,
        options: { headers: Record<string, string>; body: object },
    ) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(options.body),
                signal: controller.signal,
            });
            if (!response.ok)
                throw new Error(
                    `${provider} rejected the email (${response.status}): ${await this.readProviderError(provider, response)}`,
                );
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError")
                throw new Error(
                    `${provider} API did not respond within 10 seconds.`,
                    { cause: error },
                );
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    private async readProviderError(
        provider: "Brevo" | "Resend",
        response: Response,
    ) {
        const body = (await response.text()).slice(0, 500);
        try {
            const parsed = JSON.parse(body) as {
                message?: string;
                code?: string;
            };
            const message = parsed.message || parsed.code || body;
            if (
                provider === "Resend" &&
                response.status === 403 &&
                /only send testing emails to your own email address/i.test(
                    message,
                )
            )
                return "Resend is in test mode and can only send to the account owner. Verify a domain in Resend and configure RESEND_FROM with an address on that domain.";
            return message || "No error details";
        } catch {
            return body || "No error details";
        }
    }

    private isConfigured() {
        if (this.provider === "console") return true;
        if (this.provider === "brevo")
            return Boolean(
                process.env.BREVO_API_KEY?.trim() &&
                process.env.BREVO_FROM_EMAIL?.trim(),
            );
        if (this.provider === "resend")
            return Boolean(process.env.RESEND_API_KEY?.trim());
        return false;
    }

    private developmentFallback(purpose: string, email: string, code: string) {
        console.log(`[DEV EMAIL] ${purpose} code for ${email}: ${code}`);
        return {
            delivered: false,
            devCode: process.env.NODE_ENV === "production" ? undefined : code,
        };
    }

    private escapeHtml(value: string) {
        return value.replace(
            /[&<>'"]/g,
            (character) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "'": "&#39;",
                    '"': "&quot;",
                })[character] ?? character,
        );
    }
}
