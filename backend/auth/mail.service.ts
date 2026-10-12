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
            return this.developmentFallback("xác nhận", email, code);
        const safeName = this.escapeHtml(displayName);
        await this.send({
            to: email,
            subject: "Mã xác nhận tài khoản Jeju",
            text: `Xin chào ${displayName}, mã xác nhận tài khoản Jeju của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="margin:0 0 18px">Xác nhận tài khoản Jeju</h1><p>Xin chào <strong>${safeName}</strong>,</p><p>Nhập mã dưới đây để hoàn tất đăng ký:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">Mã có hiệu lực trong 10 phút. Không chia sẻ mã này với người khác.</p></div>`,
        });
        return { delivered: true, devCode: undefined };
    }

    async sendPasswordResetCode(
        email: string,
        displayName: string,
        code: string,
    ) {
        if (this.provider === "console")
            return this.developmentFallback("đặt lại mật khẩu", email, code);
        const safeName = this.escapeHtml(displayName);
        await this.send({
            to: email,
            subject: "Đặt lại mật khẩu Jeju",
            text: `Xin chào ${displayName}, mã đặt lại mật khẩu của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1>Đặt lại mật khẩu Jeju</h1><p>Xin chào <strong>${safeName}</strong>,</p><p>Mã đặt lại mật khẩu của bạn:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p></div>`,
        });
        return { delivered: true, devCode: undefined };
    }

    private async send(email: EmailMessage) {
        if (this.provider === "brevo") return this.sendWithBrevo(email);
        if (this.provider === "resend") return this.sendWithResend(email);
        throw new Error(
            `EMAIL_PROVIDER không hợp lệ: "${this.provider}". Chỉ hỗ trợ "console", "brevo" hoặc "resend".`,
        );
    }

    private async sendWithBrevo(email: EmailMessage) {
        const apiKey = process.env.BREVO_API_KEY?.trim();
        const senderEmail = process.env.BREVO_FROM_EMAIL?.trim().toLowerCase();
        const senderName = process.env.BREVO_FROM_NAME?.trim() || "Jeju";
        if (!apiKey) throw new Error("Chưa cấu hình BREVO_API_KEY.");
        if (!senderEmail) throw new Error("Chưa cấu hình BREVO_FROM_EMAIL.");
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
        if (!apiKey) throw new Error("Chưa cấu hình RESEND_API_KEY.");
        if (/@(yourdomain\.com|example\.com)>?$/i.test(sender))
            throw new Error(
                "RESEND_FROM vẫn đang dùng domain mẫu. Hãy dùng onboarding@resend.dev để thử nghiệm hoặc một domain đã xác minh trên Resend.",
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
                    `${provider} từ chối gửi email (${response.status}): ${await this.readProviderError(provider, response)}`,
                );
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError")
                throw new Error(
                    `${provider} API không phản hồi trong 10 giây.`,
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
                return "Resend đang ở chế độ thử nghiệm và chỉ cho phép gửi tới email chủ tài khoản. Hãy xác minh domain trên Resend và cấu hình RESEND_FROM bằng địa chỉ thuộc domain đó.";
            return message || "Không có nội dung lỗi";
        } catch {
            return body || "Không có nội dung lỗi";
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
        console.log(`[DEV EMAIL] Mã ${purpose} cho ${email}: ${code}`);
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
