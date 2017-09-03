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
    newEvent({
      token,
      workerName: worker,
      action,
      gpus,
      hashrate,
      share,
    });
  } else if (action === 'regular') {
    let gpus = req.body.payload;
    newEvent({
      token,
      workerName: worker,
      action,
      gpus,
    });
  }
  res.json({msg: 'ok'});
});

router.get('/miners', function(req, res, next) {
  let miners = getMiners();
  res.json(miners);
})

module.exports = router;
