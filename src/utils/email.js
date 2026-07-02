const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log("Starting email...");

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASSWORD:",
      process.env.EMAIL_PASSWORD ? "Loaded" : "Missing"
    );

    console.log("Verifying SMTP...");
    await transporter.verify();

    console.log("SMTP Connected");

    console.log("Sending email...");
    await transporter.sendMail({
      from: `"Sharyx AI Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent");
  } catch (err) {
    console.error("Email Error:");
    console.error(err);
  }
};

module.exports = { sendEmail };