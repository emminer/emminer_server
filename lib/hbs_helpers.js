const _ = require('lodash');

module.exports = function(hbs) {
  hbs.registerHelper('totalProfits', function(coins) {
    let sum = Math.round(_.sumBy(coins, 'profit'));
    return isNaN(sum) ? 0 : sum;
  });
};
