
const nodemailer = require("nodemailer");

//TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//SEND MAIL
const sendMail = async ({ to, action, data }) => {

  let subject = "";
  let html = "";

  switch (action) {
    case "LOGIN_OTP":
      subject = "Your Login OTP";
      html = `
        <h2>Login Verification</h2>
        <p>Your OTP is:</p>
        <h1>${data.otp}</h1>
        <p>This OTP is valid for ${data.expiry} minutes.</p>
      `;
      break;

    case "PASSWORD_RESET":
      subject = "Forgot Password Request";
      html = `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${data.otp}</h1>
        <p>This OTP is valid for ${data.expiry} minutes.</p>
      `;
      break;

    case "SEND_CREDENTIALS":
      subject = "Your ERP Account Credentials";
      html = `
        <h2>Welcome to ERP System</h2>
        <p>Your account has been created.</p>

        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>

        <p>Please login and change your password immediately.</p>
      `;
      break;

    default:

      throw new Error("Invalid mail action");
  }

  await transporter.sendMail({
    from: `"ERP System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = sendMail;
