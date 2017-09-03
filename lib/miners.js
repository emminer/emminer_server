const moment = require('moment');
let miners = [];

function getMiners() {
  return miners;
}

function newEvent(opts) {
  let now = moment();
  let { token, workerName, action } = opts;
  let matchedMiners = miners.filter(m => m.token === token);
  let miner;
  if (matchedMiners.length > 0) {
    miner = matchedMiners[0];
  } else {
    miner = { token, workers: [] };
    miners.push(miner);
  };

  let matchedWorkers = miner.workers.filter(w => w.name === workerName);
  let worker;
  if (matchedWorkers.length) {
    worker = matchedWorkers[0];
  } else {
    worker = {name: workerName};
    miner.workers.push(worker);
  }

  if (action === 'share') {
    worker.lastSeen = worker.lastShare = now;
    worker.gpus = opts.gpus;
    worker.hashrate = opts.hashrate;
    //opts.share: {gpu=2, status='accepted|rejected|invalid'}
  } else if (action === 'regular') {
    worker.lastSeen = now;
    worker.gpus = opts.gpus.map((g, index) => {
      let newGpu = Object.assign({}, g);
      if (worker.gpus && worker.gpus.length > (index + 1)){
        newGpu.hashrate = worker.gpus[index].hashrate;
      }
      return newGpu;
    });
  }
}

module.exports = { getMiners, newEvent };
