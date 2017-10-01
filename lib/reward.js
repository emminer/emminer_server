const Promise = require('bluebird');
const { get } = require('./request');
const USD2CNY = require('../config').USD2CNY;
const USD_PER_WATT = Math.round((0.5 / USD2CNY) * 1000) / 1000;
const COINS = {
  ZEC: { path: '166-zec-equihash',
    hashrateHandler: function(hashrate){
    return hashrate * 1000;
  },
}

function rewardByCoin(coinName, hashrate, poolfee, watts) {
  let coin = COINS[coinName];
  if (!coin) {
    return Promise.resolve(null);
  }
  if (coin.hashrateHandler){
    hashrate = coin.hashrateHandler(hashrate);
  }

  const url = `https://whattomine.com/coins/${coin.path}.json?utf8=%E2%9C%93&hr=${hashrate}&p=${watts}&fee=${poolfee}&cost=${USD_PER_WATT}&hcost=0.0&commit=Calculate`;
  return get(url).then(body => {
    let revenue = Math.round(parseFloat(body.revenue.replace('$', '')) * USD2CNY * 100) / 100;
    let profit = Math.round(parseFloat(body.profit.replace('$', '')) * USD2CNY * 100) / 100;
    return {revenue, profit};
  });
}

module.exports = rewardByCoin;
