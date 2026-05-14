// functions/submit.js
// This is a Cloudflare Pages Function that will handle the form submission.

export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const data = Object.fromEntries(formData);

        // Basic validation
        if (!data.name || !data.email || !data.gmaps_url) {
            return new Response(JSON.stringify({ message: "Missing required fields." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Use the RESEND_API_KEY secret from the Cloudflare environment
        const resendApiKey = context.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY is not set in the environment.");
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
                from: 'Analyse-Bestilling <noreply@mindmatter.no>', // This needs to be a verified domain in your Resend account
                to: ['adrian@mindmatterlab.no'],
                subject: 'Ny bestilling: Kunde-Feedback Analyse',
                html: `
                    <h1>Ny bestilling har kommet inn!</h1>
                    <p><strong>Navn:</strong> ${data.name}</p>
                    <p><strong>E-post:</strong> ${data.email}</p>
                    <p><strong>Google Maps URL:</strong> <a href="${data.gmaps_url}">${data.gmaps_url}</a></p>
                    <hr>
                    <p>Neste steg: Fakturer kunden, og sett Orion på saken for å kjøre analysen.</p>
                `,
            }),
        });

        if (response.ok) {
            return new Response(JSON.stringify({ message: "Takk for din bestilling! Vi kontakter deg på e-post snart." }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            const errorData = await response.json();
            return new Response(JSON.stringify({ message: 'Det oppstod en feil ved sending.', error: errorData }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Server error.', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
