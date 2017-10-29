const _ = require('lodash');

module.exports = function(hbs) {
  hbs.registerHelper('totalProfits', function(coins) {
    return Math.round(_.sumBy(coins, 'profit'));
  });
};
