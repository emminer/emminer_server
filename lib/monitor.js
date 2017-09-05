const moment = require('moment');
const CronJob = require('cron').CronJob;
const { getMiners, getWorkerStatus } = require('./miners');
const { sendEmail } = require('./email');
const notificationLogs = [];

function run() {
  const miners = getMiners();
  miners.forEach(checkMiner);
}

function checkMiner(miner) {
  const now = moment();
  const deaaWorkers = [];
  for (let i = miner.workers.length - 1; i >= 0; i--) {
    let worker = miner.workers[i];
    let status = getWorkerStatus(worker);
    if (status === 'dead' || status === 'disconnected' || status === 'noshare') {
      //get last send
      let notificationsIn1hr = notificationLogs.filter(n => {
        if (n.status !== status || n.worker !== worker.name) {
          return false;
        }

        let diff = now.diff(n.time, 'hours');
        return diff <= 1;
      }).length;
      if (notificationsIn1hr < 3) {
        let notificationsIn5Min = notificationLogs.filter(n => {
          if (n.status !== status || n.worker !== worker.name) {
            return false;
          }

          let diff = now.diff(n.time, 'minutes');
          return diff <= 5;
        }).length;
        if (notificationsIn5Min == 0) {
          let to = miner.email;
          let subject = `emminer: worker ${worker.name} is ${status}`;
          let body = `worker: <b>${worker.name}</b>`;
          sendEmail(to, subject, body, (err) => {
            if (err) {
              return console.error(err);
            }

            notificationLogs.unshift({
              worker: worker.name,
              status,
              time: now,
            });
          });
        }
      }
      if (status === 'dead') {
        miner.workers.splice(i, 1);//remove dead worker
      }
    }
  }
}

//check miners every 10 seconds.
const job = new CronJob('*/10 * * * * *', run, null, false, 'Asia/Shanghai');

module.exports = job;
