import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterLocalUserDto {
  @IsString()
  @MinLength(6)
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(20)
  credential: string;
}

export class RegisterUserAuthDto {
  id: string;
  user: string;
  providerType: string; // 'google', 'local', 'github'
  providerId: AuthProviderType; // Google `sub`, GitHub id, etc.
  credential: string | null; // hashed password (null for OAuth)
  providerMetadata: Record<string, any> | null;
}

export type AuthProviderType = 'local' | 'google' | 'github';
