var express = require('express');
var router = express.Router();

let { reportStatus } = require('../lib/farms');

router.post('/farms/status', function(req, res, next) {
  let token = req.get('FARM_TOKEN');
  var result = reportStatus(token, req.body);
  if (result.code != 200) {
    return res.status(result.status).send({msg: result.msg});
  }

  res.json({msg: 'OK'});
});

module.exports = router;
