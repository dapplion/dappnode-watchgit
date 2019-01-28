const fs = require('fs')
const getLatestCommit = require('./getLatestCommit');
const updateRepo = require('./updateRepo')
// Utils
const cacheUtils = require('./utils/cacheUtils')
const configUtils = require('./utils/configUtils')
const setIntervalAndRun = require('./utils/setIntervalAndRun')

// process.env.GITHUB_TOKEN, required
// process.env.CACHE_PATH, default = "./.cache"
// process.env.CONFIG_PATH, default = "./watchgit.config"
// process.env.INTERVAL, default = 60000 (1 min)

setIntervalAndRun(loop, process.env.INTERVAL || 60 * 1000)

async function loop() {
    // Load config (read-only) and cache
    const config = await configUtils.read()
    const cache = await cacheUtils.read()
    // Logic to decide if a repo must be updated
    for (const repo in config) {
        const branch = config[repo] || 'master'
        const prevBranch = (cache[repo] || {}).branch
        const prevSha = (cache[repo] || {}).sha
        const sha = await getLatestCommit({repo, branch})
        if (prevBranch !== branch || prevSha !== sha) {
            // Update repo
            console.log(`Updating repo ${repo}:${branch} to ${sha}`)
            // await updateRepo({user: 'dappnode', repo, branch})
            cache[repo] = {branch, sha}
        }
    }
    console.log(`Checked repos ${Object.keys(config).join(', ')}`)
    // Check if a field in the cache must be deleted
    for (const repo in cache) {
        if (!config[repo]) delete cache[repo]
    }
    // Update cache
    await cacheUtils.write(cache)
}
