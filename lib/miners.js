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
    if (!worker.startedAt) {
      worker.startedAt = now;
    }
    worker.gpus = opts.gpus;
    worker.hashrate = opts.hashrate;
    //opts.share: {gpu=2, status='accepted|rejected|invalid'}
  } else if (action === 'regular') {
    worker.lastSeen = now;
    if (!worker.startedAt) {
      worker.startedAt = now;
    }
    worker.gpus = opts.gpus.map((g, index) => {
      let newGpu = Object.assign({}, g);
      if (worker.gpus && worker.gpus.length > index){
        newGpu.hashrate = worker.gpus[index].hashrate;
      }
      return newGpu;
    });
  } else if (action === 'start') {
    worker.startedAt = worker.lastSeen = now;
    worker.gpus = opts.gpus;
  }
}

function getWorkerStatus(worker) {
  const now = moment();
  const { lastSeen, lastShare } = worker;
  let lastSeenDiff = now.diff(lastSeen, 'minutes');
  let lastShareDiff = now.diff(lastShare, 'minutes');

  if (lastSeenDiff >= 60) {
      return 'dead';
  } else if (lastSeenDiff >= 5) {
    return 'disconnected';
  } else if (!lastShare || lastShareDiff >= 5) {
    return 'stopped';
  } else {
    return 'ok';
  }
}

module.exports = { getMiners, newEvent, getWorkerStatus };
