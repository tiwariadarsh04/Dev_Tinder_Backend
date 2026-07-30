const { Resend } = require("resend");

// Render Env Variable se uthayega ya fallback key
const resendApiKey = process.env.RESEND_API_KEY || "re_YOUR_RESEND_API_KEY_HERE";
const resend = new Resend(resendApiKey);

async function main(toEmailId, otp) {
  try {
    const data = await resend.emails.send({
      from: "DevTinder <onboarding@resend.dev>", // Testing ke liye Resend default domain
      to: [toEmailId],
      subject: "🔒 Verify Your Email - DevTinder",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 400px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #ff6f61;">🔒 Your OTP Code</h2>
            <p style="font-size: 16px; color: #333;">Use the OTP below to verify your email.</p>
            <div style="display: inline-block; background: #ff6f61; color: #fff; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #777; margin-top: 15px;">This OTP will expire in <b>10 minutes</b>.</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent via Resend HTTP API! ID:", data.id);
    return true;
  } catch (error) {
    console.error("❌ Error sending email via Resend:", error.message);
    console.log("🔑 [Fallback OTP Console Log]:", otp);
    return false;
  }
}

module.exports = { main };