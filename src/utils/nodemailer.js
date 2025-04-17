const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Ensure this is correct for Gmail
  port: 587, // Use 587 for STARTTLS
  secure: false, // STARTTLS requires secure to be false
  auth: {
    user: "Tiwariadarsh@gmail.com",
    pass: "ofsrekmyfnvadhno",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main(toEmailId, otp) {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: "tiwariadarsh0428@gmail.com", // sender address
      //   to: "bar@example.com, baz@example.com", // list of receivers
      to: toEmailId,
      subject: "Verify Your Email",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
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
        </div>`,
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  } catch (error) {
    console.log("Error in nodemailer is :", error);
  }
}

module.exports = { main };
