var express = require('express');
var router = express.Router();

let { getMiners, newEvent } = require('../lib/miners');

/* GET home page. */
router.post('/events', function(req, res, next) {
  let token = req.get('MINER_TOKEN');
  let worker = req.get('MINER_WORKER');
  let action = req.body.action;
  if (action === 'share') {
    let { share, gpus, hashrate } = req.body.payload;
    let result = newEvent({
      token,
      workerName: worker,
      action,
      gpus,
      hashrate,
      share,
    });
    if (!result) {
      return res.send(401);
    }
  } else if (action === 'regular' || action === 'start') {
    let gpus = req.body.payload;
    let result = newEvent({
      token,
      workerName: worker,
      action,
      gpus,
    });
    if (!result) {
      return res.send(401);
    }
  }
  res.json({msg: 'ok'});
});

router.get('/miners', function(req, res, next) {
  let miners = getMiners();
  res.json(miners);
})

module.exports = router;
