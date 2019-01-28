const shell = require('./utils/shell')
const editCompose = require('./utils/editCompose')

async function updateRepo({user, repo, branch, destPath = '/usr/src/dappnode/DNCORE/'}) {
    const repoTag = `DNP_${repo.toUpperCase()}`
    const repoDir = `${destPath}/${repoTag}`
    const repoUrl = `https://github.com/${user}/${repoTag}.git`
    await shell(`sudo rm -rf ${repoDir}`)
    await shell(`mkdir -p ${repoDir}`)
    await shell(`git clone ${repoUrl} --depth=1 --branch ${branch} --single-branch ${repoDir}`)
    const buildCompose = `${repoDir}/docker-compose*.yml`
    const targetCompose = `/usr/src/dappnode/DNCORE/docker-compose-${repo}.yml`
    await shell(`docker-compose -f ${buildCompose} build`)
    // Move the build image tag to the compose used to up the DNP
    editCompose.moveImage(buildCompose, targetCompose)
    // Up
    await shell(`docker-compose -f ${targetCompose} up -d`)
}

module.exports = updateRepo;
