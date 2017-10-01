const Promise = require('bluebird');
const { get } = require('./request');
const USD2CNY = require('../config').USD2CNY;
const USD_PER_WATT = Math.round((0.5 / USD2CNY) * 1000) / 1000;
const COINS = {
  ZEC: '166-zec-equihash',
}

function rewardByCoin(coinName, hashrate, poolfee, watts) {
  let coin = COINS[coinName];
  if (!coin) {
    return Promise.resolve(null);
  }

  const url = `https://whattomine.com/coins/${coin}.json?utf8=✓&hr=${hashrate}&p=${watts}&fee=${poolfee}&cost=${USD_PER_WATT}&hcost=0.0`;
  return get(url).then(body => {
    let revenue = Math.round(body.revenue * USD2CNY * 100) / 100;
    let profit = Math.round(body.profit * USD2CNY * 100) / 100;
    return {revenue, profit};
  });
}

module.exports = rewardByCoin;