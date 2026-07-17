import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "SyncSpace",
            link: "https://syncspacelink.com"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent); 

    const emailHTML = mailGenerator.generate(options.mailgenContent); 

    const transpoter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    const mail = {
        from: "mail.syncspacemanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    }

    try {
        await transpoter.sendMail(mail);
    } catch (error) {
        console.error("Email service failed silently !");
        console.error("Error : " , error);
    }
}

const emailVerificationMailgenContent = (username, verificationURL) => {
    return {
        body : {
            name: username,
            intro: "Welcome to SyncSpace! We\'re very excited to have you on board.",
            action: {
                instructions: "To get started with SyncSpace, please click here:",
                button: {
                    color: "#FDAAAA",
                    text: "Verify your email",
                    link: verificationURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    };
};

const forgotPasswordMailgenContent = (username, passwordResetURL) => {
    return {
        body : {
            name: username,
            intro: "We got a request to reset the password of your account",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#FDAAAA",
                    text: "Reset Password",
                    link: passwordResetURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendMail
};