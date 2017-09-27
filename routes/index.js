var express = require('express');
var router = express.Router();
var moment = require('moment');
const prettyMs = require('pretty-ms');
let { FARMS, getRigStatus } = require('../lib/farms');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express Mining Farm' });
});

router.get('/farms/:id', function(req, res, next) {
  let id = req.params.id;
  let farms = (FARMS || []).filter(m => m.token === id);
  let farm = farms.length ? farms[0] : null;
  if (!farm) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    return;
  }

  const now = moment();
  const rigs = farm.rigs || [];

  const rigSummaries = [];
  for (let rig of rigs) {
    rigSummaries.push({
      name: rig.name,
      coin: rig.coin,
      cards: rig.gpu ? rig.gpu.length : 0,
      gpus: rig.gpu,
      unit: rig.hashrate ? rig.hashrate.unit : 'HS',
      hashrate: rig.hashrate ? rig.hashrate.current : 0,
      startedAt: duration(rig.startedAt, now),
      lastSeen: duration(rig.lastSeen, now),
      styles: {
        rig: getRigStyle(rig)
      }
    });
  }

  res.render('farm_overview', { title: '东山煤矿', farm, rigs: rigSummaries });
});

function getRigStyle(rig) {
  const status = getRigStatus(rig);
  if (status === 'dead') {
    return 'uk-label-danger';
  } else if (status === 'starting') {
    return 'uk-label-warning';
  } else if (status === 'ok') {
    return 'uk-label-success';
  } else {
    return '';
  }
}

function duration(time, now) {
  let ms = moment(now).diff(time, 'milliseconds');
  if (ms < 1000) {
    return '~1s';
  }
  return prettyMs(ms, {compact: true});
}

module.exports = router;
