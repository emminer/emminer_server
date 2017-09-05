const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.smtp,
  port: config.smtp_port,
  secure: 465 === config.smtp_port,
  auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
  }
});

function sendEmail(to, subject, body, cb) {
  let mailOptions = {
    from: config.email_from,
    to,
    subject,
    html: body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return cb && cb(error);
    }
    cb && cb(null, info);
  });
}

module.exports = { sendEmail };
