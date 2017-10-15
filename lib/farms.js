const moment = require('moment');
const Promise = require('bluebird');
const _ = require('lodash');
const { FARMS } = require('../config');
const { sendEmail } = require('./email');
const reward = require('./reward');
const nvidiaSMIErrorNotificationLogs = [];

function reportStatus(farmToken, payload) {
  let farm = _.find(FARMS, f => f.token === farmToken);
  if (!farm) {
    return {code: 404};
  }

  let now = moment();
  if (!payload || !payload.rigs || !payload.rigs.length) {
    return {code: 400, msg: 'rigs could not be null'};
  }

  if (farm.dead || !farm.lastSeen) {
    farm.dead = false;
    sendEmail(farm.email, 'farm is alive.', 'Good news.');
  }
  farm.lastSeen = moment();
  let resets = payload.rigs.filter(rig => (rig.lastAction || {}).action === 'reset' && !rig.offline);
  if (resets.length) {
    let subject = 'Resetted ';
    let body;
    if (resets.length <= 3) {
      subject += resets.map(rig => rig.name).join(',') + '.';
    } else {
      subject += `${resets.length} rigs.`
    }
    body = resets.map(rig => {
      let hashrate = rig.hashrate ? `${rig.hashrate.current}${rig.hashrate.unit}` : 0;
      let action = rig.lastAction ? `${rig.lastAction.action}-${rig.lastAction.reason}` : '-';
      let summary = `${rig.name} ${rig.coin} ${rig.pool.name} hs:${hashrate} action:${action} SorH:${rig.resettedSoftOrHard} nvidia_smi_error:${rig.nvidia_smi_error} \n<br />--------------------------\n<br />`;
      let gpus = (rig.gpu || []).map(gpu => {
        return `${gpu.index} ${gpu.temp}C ${gpu.fan}%`;
      }).join('\n<br />');
      return summary + gpus;
    }).join('\n\n<br /><br />');

    sendEmail(farm.email, subject, body);
  }

  let nvidiaSMIErrorRigs = payload.rigs.filter(rig => {
    let send = (rig.lastAction || {}).action !== 'reset' && !rig.offline && rig.nvidia_smi_error;
    if (send) {
      send = nvidiaSMIErrorNotificationLogs.filter(n => {
        return n.token === farm.token && n.rig === rig.name && now.diff(n.time, 'hours') <= 1;
      }).length < 3;
    }
    if (send) {
      nvidiaSMIErrorNotificationLogs.push({
        token: farm.token,
        rig: rig.name,
        time: now.clone(),
      });
    }
    return send;
  });

  if (nvidiaSMIErrorRigs.length) {
    let nvidiaSMISubject = 'nvidia-smi ';
    let nvidiaSMIBody;
    if (nvidiaSMIErrorRigs.length <= 3) {
      nvidiaSMISubject += nvidiaSMIErrorRigs.map(rig => rig.name).join(',') + '.';
    } else {
      nvidiaSMISubject += `${nvidiaSMIErrorRigs.length} rigs.`;
    }

    nvidiaSMIBody = nvidiaSMIErrorRigs.map(rig => {
      let hashrate = rig.hashrate ? `${rig.hashrate.current}${rig.hashrate.unit}` : 0;
      let action = rig.lastAction ? `${rig.lastAction.action}-${rig.lastAction.reason}` : '-';
      let summary = `${rig.name} ${rig.coin} ${rig.pool.name} hs:${hashrate} action:${action} nvidia_smi_error:${rig.nvidia_smi_error} \n<br />--------------------------\n<br />`;
      let gpus = (rig.gpu || []).map(gpu => {
        return `${gpu.index} ${gpu.temp}C ${gpu.fan}%`;
      }).join('\n<br />');
      return summary + gpus;
    });
    sendEmail(farm.email, nvidiaSMISubject, nvidiaSMIBody);
  }

  farm.rigs = payload.rigs;

  let coins = _.groupBy(farm.rigs, 'coin');
  farm.coins = [];
  Object.keys(coins).forEach(coinName => {
    let rigsByCoin = coins[coinName];
    let totalHashrate = 0;
    let watts = 0;
    rigsByCoin.forEach(rig => {
      totalHashrate += (rig.hashrate ? rig.hashrate.current : 0);
      watts += rig.watts || 0;
    })

    let unit = rigsByCoin[0].hashrate ? rigsByCoin[0].hashrate.unit : '';
    let hashrateStr = totalHashrate.toFixed(2) + unit;
    let coinSummary = {
      coin: coinName,
      hashrateStr,
      hashrate: totalHashrate,
      watts,
      poolfee: rigsByCoin[0].pool.fee || 0,
    };
    farm.coins.push(coinSummary);
  });

  Promise.map(farm.coins, coin => {
    return reward(coin.coin, coin.hashrate, coin.poolfee, coin.watts)
      .then(profit => {
        if (profit) {
          coin.profit = profit.profit;
        }
      }).catch();
  });
  return {code: 200};
}

function getRigStatus(rig) {
  if (!rig.lastAction) {
    return 'dead';
  } else if (rig.lastAction.action === 'reset') {
    return 'dead';
  } else if (rig.lastAction.action === 'startup') {
    return 'starting';
  } else {
    return 'ok';
  }
}

module.exports = { reportStatus, FARMS, getRigStatus };
