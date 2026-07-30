const nodemailer = require("nodemailer");

const userEmail = process.env.EMAIL_USER || "tiwariadarsh0428@gmail.com";
const userPass = process.env.EMAIL_PASS || "klldfhtgvweyljri"; // Spaces mat rakhna App Pass me

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: userPass.replace(/\s+/g, ""), // Automatic spaces clean up
  },
});

async function main(toEmailId, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"DevTinder" <${userEmail}>`,
      to: toEmailId, // KISI BHI USER KA EMAIL HO SAKTA HAI
      subject: "🔒 Verify Your Email - DevTinder",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 400px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px;">
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

    console.log("✅ Email sent successfully to:", toEmailId);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    console.log("🔑 [Fallback OTP Console Log]:", otp);
    return false;
  }
}

module.exports = { main };