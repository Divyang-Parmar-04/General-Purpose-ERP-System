
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  try {
    const msg = {
      to,
      from: process.env.EMAIL_USER,
      subject,
      html
    };

    await sgMail.send(msg);
    console.log("Mail sent successfully");
  } catch (error) {
    console.log("mailError :", error.response.body.errors)
  }
};

module.exports = sendMail;
