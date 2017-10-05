const Promise = require('bluebird');
const { get } = require('./request');
const USD2CNY = require('../config').USD2CNY;
const USD_PER_KWH = Math.round((0.5 / USD2CNY) * 1000) / 1000;
function M2K(hashrate) {
  return hashrate * 1000;
}
const COINS = {
  ZEC: {
    path: '166-zec-equihash',
    hashrateHandler: M2K
  },
  ETH: '151-eth-ethash',
  XZC: {
    path: '175-xzc-lyra2z',
    hashrateHandler: M2K
  },
  BSD: '201-bsd-xevan',
}

function rewardByCoin(coinName, hashrate, poolfee, watts) {
  let coin = COINS[coinName];
  if (!coin) {
    return Promise.resolve(null);
  }
  if (coin.hashrateHandler){
    hashrate = coin.hashrateHandler(hashrate);
  }
  let path;
  if (typeof coin === 'string') {
    path = coin;
  } else {
    path = coin.path;
  }

  const url = `https://whattomine.com/coins/${path}.json?utf8=%E2%9C%93&hr=${hashrate}&p=${watts}&fee=${poolfee}&cost=${USD_PER_KWH}&hcost=0.0&commit=Calculate`;
  return get(url).then(body => {
    let revenue = Math.round(parseFloat(body.revenue.replace('$', '')) * USD2CNY * 100) / 100;
    let profit = Math.round(parseFloat(body.profit.replace('$', '')) * USD2CNY * 100) / 100;
    return {revenue, profit};
  });
}

module.exports = rewardByCoin;
