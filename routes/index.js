var express = require('express');
var router = express.Router();
var moment = require('moment');
const prettyMs = require('pretty-ms');
let { getMiners } = require('../lib/miners');

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
      lastSeen: duration(worker.lastSeen, now),
      lastShare: worker.lastShare ? duration(worker.lastShare, now) : '-',
      styles: {
        worker: getWorkerStyle(worker)
      }
    })
  }
  res.render('miner_overview', { title: 'Overview', miner, workers: workerSummaries });
});

function getWorkerStyle(worker) {
  const now = moment();
  const { lastSeen, lastShare } = worker;
  let lastSeenDiff = now.diff(lastSeen, 'minutes');
  let lastShareDiff = now.diff(lastShare, 'minutes');
  if (lastSeenDiff >= 5) {
    return 'uk-label-danger';
  } else if (lastShareDiff >= 5) {
    return 'uk-label-warning';
  } else {
    return 'uk-label-success';
  }
}

function duration(time, now) {
  let ms = moment(now).diff(time, 'milliseconds');
  return prettyMs(ms, {compact: true});
}

module.exports = router;
