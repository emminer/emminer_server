module.exports = {
  smtp: process.env.SMTP,
  smtp_port: +(process.env.SMTP_PORT),
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  email_from: process.env.EMAIL_FROM,
  USD2CNY: parseFloat(process.env.USD2CNY) || 6.5,
  CNY_PER_KWH: parseFloat(process.env.CNY_PER_KWH) || 0.675,
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
      alias: farm.split('|')[2],
      rigs: [],
    };
  });
}
