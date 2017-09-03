var express = require('express');
var router = express.Router();
var moment = require('moment');
let { getMiners } = require('../lib/miners');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/miners/:id', function(req, res, next) {
  let id = req.params.id;
  console.log(getMiners());
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
      hashrate: worker.hashrate || 0,
      lastSeen: worker.lastSeen.fromNow(true),
      lastShare: worker.lastShare ? worker.lastShare.fromNow(true) : '-',
    })
  }
  res.render('miner_overview', { title: 'Overview', miner, workers: workerSummaries });
});

module.exports = router;
