import { Injectable } from '@nestjs/common'

type ResendEmail = { to: string; subject: string; text: string; html: string }

@Injectable()
export class MailService {
  private readonly configured = Boolean(process.env.RESEND_API_KEY)

  async sendVerificationCode(email: string, displayName: string, code: string) {
    if (!this.configured) return this.developmentFallback('xác nhận', email, code)
    const safeName = this.escapeHtml(displayName)
    await this.send({
      to: email,
      subject: 'Mã xác nhận tài khoản Jeju',
      text: `Xin chào ${displayName}, mã xác nhận tài khoản Jeju của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="margin:0 0 18px">Xác nhận tài khoản Jeju</h1><p>Xin chào <strong>${safeName}</strong>,</p><p>Nhập mã dưới đây để hoàn tất đăng ký:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">Mã có hiệu lực trong 10 phút. Không chia sẻ mã này với người khác.</p></div>`,
    })
    return { delivered: true, devCode: undefined }
  }

  async sendPasswordResetCode(email: string, displayName: string, code: string) {
    if (!this.configured) return this.developmentFallback('đặt lại mật khẩu', email, code)
    const safeName = this.escapeHtml(displayName)
    await this.send({
      to: email,
      subject: 'Đặt lại mật khẩu Jeju',
      text: `Xin chào ${displayName}, mã đặt lại mật khẩu của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1>Đặt lại mật khẩu Jeju</h1><p>Xin chào <strong>${safeName}</strong>,</p><p>Mã đặt lại mật khẩu của bạn:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p></div>`,
    })
    return { delivered: true, devCode: undefined }
  }

  private async send(email: ResendEmail) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM?.trim() || 'Jeju <onboarding@resend.dev>',
          to: [email.to.toLowerCase()],
          subject: email.subject,
          text: email.text,
          html: email.html,
        }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500)
        throw new Error(`Resend API trả ${response.status}: ${detail}`)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('Resend API không phản hồi trong 10 giây.', { cause: error })
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  private developmentFallback(purpose: string, email: string, code: string) {
    console.log(`[DEV EMAIL] Mã ${purpose} cho ${email}: ${code}`)
    return { delivered: false, devCode: process.env.NODE_ENV === 'production' ? undefined : code }
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character)
  }
}
