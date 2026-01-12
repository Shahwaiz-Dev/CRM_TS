
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

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

export async function sendEmail({ to, subject, text, html, from }: SendEmailParams): Promise<SendGridResponse> {
    const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
    // Default sender must be verified in SendGrid
    const sender = from || import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@example.com';

    if (!apiKey) {
        console.error('SendGrid API Key is missing. Please set VITE_SENDGRID_API_KEY in your .env file.');
        return {
            success: false,
            error: 'API Configuration Error: Missing API Key'
        };
    }

    if (!to || to.length === 0) {
        return {
            success: false,
            error: 'No recipients specified'
        };
    }

    // Create a personalization for each recipient to avoid them seeing each other's emails
    const personalizations = to.map(email => ({
        to: [{ email }]
    }));

    const content = [];
    if (text) {
        content.push({
            type: 'text/plain',
            value: text
        });
    }
    if (html) {
        content.push({
            type: 'text/html',
            value: html
        });
    } // If both are provided, SendGrid sends multipart/alternative

    if (content.length === 0) {
        return {
            success: false,
            error: 'Email content is required'
        };
    }

    const payload = {
        personalizations,
        from: { email: sender },
        subject,
        content
    };

    try {
        const response = await fetch(SENDGRID_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMessage = data.errors?.[0]?.message || `API Error: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return {
            success: true,
            message: 'Email sent successfully'
        };

    } catch (error) {
        console.error('Failed to send email via SendGrid:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
