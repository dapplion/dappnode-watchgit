const readFileAndCreate = require('./readFileAndCreate');

const configPath = process.env.CONFIG_PATH || './watchgit.config';

// configFile:
// vpn:open_ports_script
// admin:dev

async function readConfig() {
  const data = await readFileAndCreate(configPath);
  return data
      .split(/\r?\n/)
      .filter((row) => row.trim()) // Ignore empty lines
      .reduce((obj, row) => {
        const [repo, branch] = row.trim().split(':');
        return {...obj, [repo]: branch};
      }, {});
}

module.exports = {
  read: readConfig,
};
