module.exports = {
  smtp: process.env.SMTP,
  smtp_port: +(process.env.SMTP_PORT),
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  email_from: process.env.EMAIL_FROM,
  FARMS: parseLegalFarms(process.env.LEGAL_FARMS),
};

function parseLegalFarms(data) {
  if (!data) {
    return [];
  }
  return data.split(',').map(farm => {
    return {
      token: farm.split('|')[0],
      email: farm.split('|')[1],
      rigs: [],
    };
  });
}
