const _ = require('lodash');

module.exports = function(hbs) {
  hbs.registerHelper('totalProfits', function(coins) {
    return _.sumBy(coins, 'profit');
  });
};
