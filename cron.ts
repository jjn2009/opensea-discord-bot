import {main} from './checkSales';
import {exec} from 'child_process';
import * as cron from 'node-cron';
const cluster = require('cluster');

const perHour = '0 * * * *';
const perMinute = '* * * * *';
let rate = perHour;
if (process.argv.length === 3 && process.argv[2] === 'fast') {
  rate = perMinute;
}

console.log('rate', rate);

if (cluster.isMaster || cluster.isPrimary) {
  console.log('primary');
  cron.schedule(rate, async () => {
    console.log(new Date());
    cluster.fork();
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log('fork');
  main()
    .then((res) =>{ 
      console.warn(res)
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
