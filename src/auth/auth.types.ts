import { IsEmail, Matches, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string

    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(20)
    // This Regex checks for at least one special character
    // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    //     message: 'Password must contain at least one special character (symbol)'
    // })
    password: string
}