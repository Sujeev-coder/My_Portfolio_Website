module.exports = async (req, res) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;

    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
        return res.status(500).json({
            error: "Email service is not configured."
        });
    }

    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
        return res.status(400).json({
            error: "Name, email, and message are required."
        });
    }

    const plainText = [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Project Details:",
        message
    ].join("\n");

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2 style="margin-bottom: 12px;">New Portfolio Inquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Project Details:</strong></p>
            <p style="white-space: pre-line;">${escapeHtml(message)}</p>
        </div>
    `;

    try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: CONTACT_FROM_EMAIL,
                to: [CONTACT_TO_EMAIL],
                reply_to: email,
                subject: `New portfolio inquiry from ${name}`,
                text: plainText,
                html
            })
        });

        const result = await resendResponse.json();

        if (!resendResponse.ok) {
            return res.status(resendResponse.status).json({
                error: result.message || "Failed to send email."
            });
        }

        return res.status(200).json({
            success: true,
            id: result.id
        });
    } catch (error) {
        return res.status(500).json({
            error: "Unable to send email right now."
        });
    }
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
