const request = require('request');

// API reference: "https://api.github.com/repos/dappnode/DNP_VPN/commits/open_ports_script"
// Authenticated request have a rate limiting of 5000 req/hour

function getLatestCommit({user = 'dappnode', repo, branch = 'master'}) {
  return new Promise((resolve, reject) => {
    const repoTag = `DNP_${repo.toUpperCase()}`;
    const url = `https://api.github.com/repos/${user}/${repoTag}/commits/${branch}`;
    if (!process.env.GITHUB_TOKEN) reject(Error('process.env.GITHUB_TOKEN is not defined'));
    const headers = {
      'User-Agent': 'git-watch',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    };
    request({url, headers, json: true}, function(err, res, json) {
      if (err) {
        reject(err);
      }
      else if (res.statusCode !== 200) {
        reject(Error(`Error ${res.statusCode} on url ${url}: ${(res.body || {}).message || res.body}`));
      }
      else resolve(json.sha);
    });
  });
}

module.exports = getLatestCommit;
