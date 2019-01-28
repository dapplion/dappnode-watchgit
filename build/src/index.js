const fs = require('fs');
const getLatestCommit = require('./getLatestCommit');
const updateRepo = require('./updateRepo');
// Utils
const cacheUtils = require('./utils/cacheUtils');
const configUtils = require('./utils/configUtils');
const setIntervalAndRun = require('./utils/setIntervalAndRun');

let destPath;
if (process.env.DEST_PATH) destPath = process.env.DEST_PATH;
else if (fs.existsSync('/usr/src/dappnode/DNCORE/.dappnode_profile')) destPath = '/usr/src/dappnode/DNCORE/';
else if (fs.existsSync('/usr/src/app/DNCORE/.dappnode_profile')) destPath = '/usr/src/app/DNCORE/';
else if (process.platform === 'linux') destPath = '/usr/src/dappnode-watchgit';
else if (process.platform === 'darwin') destPath = '~/dappnode-watchgit';
else throw Error('Please define process.env.DEST_PATH');

if (!process.env.GITHUB_TOKEN) throw Error('process.env.GITHUB_TOKEN is not defined');
// process.env.GITHUB_TOKEN, required
// process.env.CACHE_PATH, default = "./.cache"
// process.env.CONFIG_PATH, default = "./watchgit.config"
// process.env.INTERVAL, default = 60000 (1 min)

setIntervalAndRun(loop, process.env.INTERVAL || 60 * 1000);

async function loop() {
  try {
    // Load config (read-only) and cache
    const config = await configUtils.read();
    const cache = await cacheUtils.read();
    // Logic to decide if a repo must be updated
    await Promise.all(Object.keys(config).map(async (repo) => {
      const branch = config[repo] || 'master';
      const prevBranch = (cache[repo] || {}).branch;
      const prevSha = (cache[repo] || {}).sha;
      const sha = await getLatestCommit({repo, branch});
      if (prevBranch !== branch || prevSha !== sha) {
        // Update cache immediatelly because the build can be really long
        await cacheUtils.write({[repo]: {branch, sha}});
        await updateRepo({user: 'dappnode', repo, branch, sha, destPath});
      }
    }));
    console.log(`Checked repos ${Object.keys(config).join(', ')}`);
  } catch (e) {
    console.error(`Error updating repos: ${e.stack}`);
  }
}
