module.exports = {
  smtp: process.env.SMTP,
  smtp_port: +(process.env.SMTP_PORT),
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  email_from: process.env.EMAIL_FROM,
};
