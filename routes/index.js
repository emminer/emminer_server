var express = require('express');
var router = express.Router();
var moment = require('moment');
const prettyMs = require('pretty-ms');
let { getMiners, getWorkerStatus } = require('../lib/miners');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/miners/:id', function(req, res, next) {
  let id = req.params.id;
  let miners = (getMiners() || []).filter(m => m.token === id);
  let miner = miners.length ? miners[0] : null;
  if (!miner) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    return;
  }

  const now = moment();
  const workers = miner.workers || [];
  miner.hashrate = 0;
  const workerSummaries = [];
  for (let worker of workers) {
    miner.hashrate += (worker.hashrate || 0);
    workerSummaries.push({
      name: worker.name,
      cards: worker.gpus ? worker.gpus.length : 0,
      gpus: worker.gpus,
      hashrate: worker.hashrate || 0,
      startedAt: duration(worker.startedAt, now),
      lastSeen: duration(worker.lastSeen, now),
      lastShare: worker.lastShare ? duration(worker.lastShare, now) : '-',
      styles: {
        worker: getWorkerStyle(worker)
      }
    })
  }
  if (miner.hashrate > 0) {
    miner.hashrate = miner.hashrate.toFixed(2);
  }
  res.render('miner_overview', { title: 'Overview', miner, workers: workerSummaries });
});

function getWorkerStyle(worker) {
  const status = getWorkerStatus(worker);
  if (status === 'dead' || status === 'disconnected') {
    return 'uk-label-danger';
  } else if (status === 'noshare') {
    return 'uk-label-warning';
  } else if (status === 'ok') {
    return 'uk-label-success';
  } else {
    return '';
  }
}

function duration(time, now) {
  let ms = moment(now).diff(time, 'milliseconds');
  return prettyMs(ms, {compact: true});
}

module.exports = router;
