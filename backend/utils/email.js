const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.HOST_EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Telehealth App" <${process.env.HOST_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;