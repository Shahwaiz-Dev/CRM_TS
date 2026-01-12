
import emailjs from '@emailjs/browser';

interface EmailResponse {
    success: boolean;
    message?: string;
    error?: string;
}

interface SendEmailParams {
    to: string[];
    subject: string;
    text: string;
}

// Initialize EmailJS
// You should call this once in your app, e.g., in main.tsx or App.tsx, 
// but calling it here lazily is also fine if it checks initialization.
// However, @emailjs/browser's init() is strictly for the public key.
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
if (PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
}

export async function sendEmail({ to, subject, text }: SendEmailParams): Promise<EmailResponse> {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        console.error('EmailJS Configuration Error. IDs missing.');
        return {
            success: false,
            error: 'Configuration Error: Missing EmailJS Env Variables (Service ID, Template ID, or Public Key)'
        };
    }

    if (!to || to.length === 0) {
        return {
            success: false,
            error: 'No recipients specified'
        };
    }

    try {
        // Prepare the parameters for the template.
        // NOTE: The template in EmailJS must use {{subject}}, {{message}}, and {{to_email}} or similar variables.
        // Sending to multiple people: 
        // 1. You can comma-separate emails in 'to_email' if the provider (like SendGrid via EmailJS) supports it.
        // 2. OR loop through and send individual emails (be careful of rate limits).
        // For this implementation, we will try the comma-separated approach which works with many SMTP services linked to EmailJS.

        const templateParams = {
            subject: subject,
            message: text,
            to_email: to.join(',') // Comma separated list of recipients
        };

        const response = await emailjs.send(serviceId, templateId, templateParams);

        if (response.status === 200) {
            return {
                success: true,
                message: 'Emails sent successfully'
            };
        } else {
            throw new Error(response.text);
        }

    } catch (error) {
        console.error('Failed to send email via EmailJS:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
