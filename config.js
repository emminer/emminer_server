module.exports = {
  smtp: process.env.SMTP,
  smtp_port: +(process.env.SMTP_PORT),
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  email_from: process.env.EMAIL_FROM,
  legal_miners: parseLegalMiners(process.env.LEGAL_MINERS),
};

function parseLegalMiners(data) {
  if (!data) {
    return [];
  }
  return data.split(',').map(miner => {
    return {
      token: miner.split('|')[0],
      email: miner.split('|')[1],
    };
  });
}
