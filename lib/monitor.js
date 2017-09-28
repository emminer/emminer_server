const moment = require('moment');
const CronJob = require('cron').CronJob;
let { FARMS } = require('../lib/farms');
const { sendEmail } = require('./email');
const notificationLogs = [];

function run() {
  FARMS.filter(f => !f.dead).forEach(checkFarm);
}

function checkFarm(farm) {
  const now = moment();
  if (!farm.lastSeen) {//not started yet
    return;
  }
  let status = getFarmStatus(farm);
  if (status === 'dead') {
    farm.dead = true;
    let subject = 'Farm is dead.';
    let fromNow = farm.lastSeen.fromNow();
    let body = `Last seen: ${fromNow}`;
    return sendEmail(farm.email, subject, body);
  } else if (status === 'lost') {
    let notificationsIn1hr = notificationLogs.filter(n => {
      return n.token === farm.token && now.diff(n.time, 'hours') <= 1;
    });
    if (notificationsIn1hr.length >= 3) {
      return;
    } else {
      let notificationsIn5Min = notificationLogs.filter(
        n => n.token === farm.token && now.diff(n.time, 'minutes') <= 5);
      if (notificationsIn5Min.length === 0) {
        let subject = 'Farm is lost.';
        let fromNow = farm.lastSeen.fromNow();
        let body = `last seen: ${fromNow}`;
        sendEmail(farm.email, subject, body);
        notificationLogs.unshift({
          token: farm.token,
          time: moment(),
        });
      }
    }
  }
}

function getFarmStatus(farm) {
  if (!farm.lastSeen) {
    return 'notStarted';
  }

  let diff = moment().diff(farm.lastSeen, 'minutes');
  if (diff >= 60) {
    return 'dead';
  } else if (diff >= 6) {
    return 'lost';
  } else {
    return 'ok';
  }
}

//check miners every 10 seconds.
const job = new CronJob('*/10 * * * * *', run, null, false, 'Asia/Shanghai');

module.exports = job;
