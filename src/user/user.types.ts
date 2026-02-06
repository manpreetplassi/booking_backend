import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Request } from 'express';
import { Profile } from 'passport-google-oauth20';

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

export interface GoogleUser {
  // user: {
    googleId: string;    // The 'id' from profile
    email: string;       // emails[0].value
    name: string;
    firstName: string;   // name.givenName
    lastName: string;    // name.familyName
    picture: string;     // photos[0].value
    accessToken: string; // Used for revoking/disconnecting
    refreshToken?: string; 
    emailVerified: Boolean;
  // },
}
// Use this interface in your Controllers
export interface RequestWithUser extends Request {
  user: GoogleUser;
}

export type AuthProviderType = 'local' | 'google' | 'github';
