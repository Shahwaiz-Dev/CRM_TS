
interface SendGridResponse {
    success: boolean;
    message?: string;
    error?: string;
}

interface SendEmailParams {
    to: string[];
    subject: string;
    text: string;
    html?: string;
    from?: string;
}

const SENDGRID_API_URL = '/api/send-email';

export async function sendEmail({ to, subject, text, html, from }: SendEmailParams): Promise<SendGridResponse> {

    if (!to || to.length === 0) {
        return {
            success: false,
            error: 'No recipients specified'
        };
    }

    const payload = {
        to,
        subject,
        text,
        html,
    };

    try {
        const response = await fetch(SENDGRID_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API Error: ${response.statusText}`);
        }

        return {
            success: true,
            message: 'Email sent successfully'
        };

    } catch (error) {
        console.error('Failed to send email via API:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
