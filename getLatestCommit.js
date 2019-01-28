const request = require('request');

// API reference: "https://api.github.com/repos/dappnode/DNP_VPN/commits/open_ports_script"
// Authenticated request have a rate limiting of 5000 req/hour

const headers = {
    "User-Agent": "git-watch",
    "Authorization": `token ${process.env.GITHUB_TOKEN}`
}

function getLatestCommit({user = 'dappnode', repo, branch = 'master'}) {
    return new Promise((resolve, reject) => {
        const repoTag = `DNP_${repo.toUpperCase()}`
        const url = `https://api.github.com/repos/${user}/${repoTag}/commits/${branch}`
        request({url, headers, json: true}, function(err, res, json) {
            if (err) {
                reject(err)
            }
            else if (res.statusCode !== 200) {
                reject(Error(`Error ${res.statusCode} on url ${url}: ${(res.body || {}).message || res.body}`)) 
            }           
            else resolve(json.sha)
        });
    })
}

module.exports = getLatestCommit;
