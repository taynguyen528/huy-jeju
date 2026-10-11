import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator'

export class RegisterDto {
  @IsString() @Length(2, 80) displayName!: string
  @IsString() @Length(3, 30) @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới.' }) username!: string
  @IsEmail() @MaxLength(255) email!: string
  @IsString() @Length(8, 72) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Mật khẩu cần có ít nhất một chữ và một số.' }) password!: string
}

export class LoginDto {
  @IsString() @Length(3, 30) username!: string
  @IsString() password!: string
}

export class ForgotPasswordDto { @IsEmail() email!: string }
export class ResetPasswordDto {
  @IsEmail() email!: string
  @IsString() @Matches(/^\d{6}$/) code!: string
  @IsString() @Length(8, 72) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Mật khẩu cần có ít nhất một chữ và một số.' }) password!: string
}

export class VerifyEmailDto {
  @IsEmail() email!: string
  @IsString() @Matches(/^\d{6}$/, { message: 'Mã xác nhận phải gồm 6 chữ số.' }) code!: string
}

export class ResendVerificationDto {
  @IsEmail() email!: string
}
