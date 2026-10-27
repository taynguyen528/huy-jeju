import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator'

export class RegisterDto {
  @IsString() @Length(2, 80) displayName!: string
  @IsString() @Length(3, 30) @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username may only contain letters, numbers, and underscores.' }) username!: string
  @IsEmail() @MaxLength(255) email!: string
  @IsString() @Length(8, 72) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password must contain at least one letter and one number.' }) password!: string
}

export class LoginDto {
  @IsString() @Length(3, 30) username!: string
  @IsString() password!: string
}

export class ForgotPasswordDto { @IsEmail() email!: string }
export class ResetPasswordDto {
  @IsEmail() email!: string
  @IsString() @Matches(/^\d{6}$/) code!: string
  @IsString() @Length(8, 72) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password must contain at least one letter and one number.' }) password!: string
}

export class VerifyEmailDto {
  @IsEmail() email!: string
  @IsString() @Matches(/^\d{6}$/, { message: 'Verification code must contain 6 digits.' }) code!: string
}

export class ResendVerificationDto {
  @IsEmail() email!: string
}
