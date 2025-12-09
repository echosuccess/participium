import { Resend } from "resend";
import { VerificationEmailError } from "../interfaces/errors/VerificationEmailError";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerificationEmail(email: string, code : string){
    try{
        await resend.emails.send({
            from: "no-reply@participium.com",
            to: email,
            subject: "Verify your email address",
            html: `<p>Your verification code is: <strong>${code}</strong></p>
                    <p>this code will expire in 30 minutes.</p>`,
        });
    }catch(error){
        console.error("Error sending verification email:", error);
        throw new VerificationEmailError();
    }
}