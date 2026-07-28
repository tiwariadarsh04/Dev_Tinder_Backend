const nodemailer = require("nodemailer");

// Use Environment variables or fallback to provided credentials
const userEmail = process.env.EMAIL_USER || "tiwariadarsh0428@gmail.com";
const userPass = process.env.EMAIL_PASS || "klld fhtg vwey ljri";

const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail service automatically sets host & port
  auth: {
    user: userEmail,
    pass: userPass,
  },
});

async function main(toEmailId, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"DevTinder" <${userEmail}>`,
      to: toEmailId,
      subject: "🔒 Verify Your Email - DevTinder",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 400px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #ff6f61;">🔒 Your OTP Code</h2>
            <p style="font-size: 16px; color: #333;">
              Use the OTP below to verify your email.
            </p>
            <div style="display: inline-block; background: #ff6f61; color: #fff; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #777; margin-top: 15px;">
              This OTP will expire in <b>10 minutes</b>.
            </p>
            <p style="font-size: 12px; color: #aaa;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully! MessageID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email via Nodemailer:", error.message);
    console.log("🔑 [Fallback OTP Console Log]:", otp);
    // Don't throw error to avoid crashing the auth flow if mail fails
    return false;
  }
}

module.exports = { main };  