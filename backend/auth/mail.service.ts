import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private readonly configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

  async sendVerificationCode(email: string, displayName: string, code: string) {
    if (!this.configured) {
      console.log(`[DEV EMAIL] Mã xác nhận cho ${email}: ${code}`)
      return { delivered: false, devCode: process.env.NODE_ENV === 'production' ? undefined : code }
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Jeju <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Mã xác nhận tài khoản Jeju',
      text: `Xin chào ${displayName}, mã xác nhận tài khoản Jeju của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="margin:0 0 18px">Xác nhận tài khoản Jeju</h1><p>Xin chào <strong>${displayName}</strong>,</p><p>Nhập mã dưới đây để hoàn tất đăng ký:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">Mã có hiệu lực trong 10 phút. Không chia sẻ mã này với người khác.</p></div>`,
    })
    return { delivered: true, devCode: undefined }
  }

  async sendPasswordResetCode(email: string, displayName: string, code: string) {
    if (!this.configured) { console.log(`[DEV EMAIL] Mã đặt lại mật khẩu cho ${email}: ${code}`); return { delivered:false, devCode:process.env.NODE_ENV==='production'?undefined:code } }
    const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})
    await transporter.sendMail({from:process.env.SMTP_FROM||`Jeju <${process.env.SMTP_USER}>`,to:email,subject:'Đặt lại mật khẩu Jeju',text:`Xin chào ${displayName}, mã đặt lại mật khẩu của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1>Đặt lại mật khẩu Jeju</h1><p>Xin chào <strong>${displayName}</strong>,</p><p>Mã đặt lại mật khẩu của bạn:</p><div style="font-size:34px;font-weight:800;letter-spacing:10px;padding:20px;background:#f5f0eb;border-radius:12px;text-align:center">${code}</div><p style="color:#666">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p></div>`})
    return {delivered:true,devCode:undefined}
  }
}
