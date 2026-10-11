import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service.js'
import { ForgotPasswordDto, LoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyEmailDto } from './auth.dto.js'

const cookieName = 'jeju_session'
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' }

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) { return this.auth.register(body) }

  @HttpCode(200) @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.verifyEmail(body); response.cookie(cookieName, result.token, cookieOptions); return { user: result.user } }

  @HttpCode(200) @Post('resend-verification')
  resendVerification(@Body() body: ResendVerificationDto) { return this.auth.resendVerification(body.email) }

  @HttpCode(200) @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) { return this.auth.requestPasswordReset(body.email) }

  @HttpCode(200) @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) { return this.auth.resetPassword(body) }

  @HttpCode(200) @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.login(body); response.cookie(cookieName, result.token, cookieOptions); return { user: result.user } }

  @HttpCode(200) @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) { response.clearCookie(cookieName, { path: '/' }); return { ok: true } }

  @Get('me')
  me(@Req() request: Request) { const token = request.cookies?.[cookieName] as string | undefined; if (!token) throw new UnauthorizedException('Bạn chưa đăng nhập.'); return { user: this.auth.verify(token) } }
}
