import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { GoogleUser } from 'src/user/user.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Your redirect URI
      scope: ['email', 'profile'],
    });
  }

  // This method is called after Google successfully authenticates the user
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // 1. Extract 'id' along with other properties
    const { id, name, emails, photos } = profile;
    // CHECK: Is the email actually verified by Google?
    const isEmailVerified = emails[0].verified === true || emails[0].verified === 'true';

    if (!isEmailVerified) {
      return done(new Error('Your Google email is not verified. Please verify it in Google settings.'), false);
    }
    const user: GoogleUser = {
      googleId: id, // This is the unique Google ID you were looking for
      email: emails[0].value,
      name: name.givenName,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken, // Store this for the "Complete Disconnect" / Revoke flow
      emailVerified: isEmailVerified, // Save this status
    };

    // 2. Pass the 'user' object to Passport, which becomes 'req.user'
    done(null, user);
  }
}