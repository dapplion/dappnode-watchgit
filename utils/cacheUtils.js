const fs = require('fs')
const {promisify} = require('util')
const readFileAndCreate = require('./readFileAndCreate')

const cachePath = process.env.CACHE_PATH || "./.cache"

// cacheFile:
// vpn:open_ports_script 3201c5d6b596f9e138bf75f42751681758853f02
// admin:dev

// cache object:
// {
//     vpn: {
//         branch: 'open_ports_script',
//         sha: '3201c5d6b596f9e138bf75f42751681758853f02'
//     },
//     admin: {
//         branch: 'dev',
//         sha: null
//     }
// }

async function readCache() {
    const data = await readFileAndCreate(cachePath)
    return data
    .split(/\r?\n/)
    .filter(row => row.trim()) // Ignore empty lines
    .reduce((obj, row) => {
        const [target, sha] = row.trim().split(' ')
        const [repo, branch] = target.trim().split(':')
        return {...obj, [repo]: {branch, sha}}
    }, {})
}

async function writeCache(cache) {
    const data = Object.keys(cache).map(repo => {
        const {branch, sha} = cache[repo]
        return `${repo}:${branch} ${sha}`
    }).join('\n').trim()
    await promisify(fs.writeFile)(cachePath, data)
}

module.exports = {
    read: readCache,
    write: writeCache
}