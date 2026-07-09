import Mailgen from "mailgen";

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
    forgotPasswordMailgenContent
};