const shell = require('./utils/shell');
const editCompose = require('./utils/editCompose');

const pad = (s = ' ') => String(s).slice(0, 20).padStart(20);
const exists = (path) => shell(`ls ${path}`).then(() => true, () => false);

async function updateRepo({user, repo, branch, sha, destPath}) {
  // Custom log function
  const log = (data) => console.log(`${pad(`${user}/${repo}`)}:${pad(branch)} | ${data}`);

  log(`Updating repo ${repo}:${branch} to ${sha}`);

  const repoTag = `DNP_${repo.toUpperCase()}`;
  const repoDir = `${destPath}/${repoTag}`;
  const repoUrl = `https://github.com/${user}/${repoTag}.git`;
  if (await exists(repoDir)) {
    try {
      log(`Repodir exists, pulling from ${repo}:${branch}...`);
      await shell(`cd ${repoDir}`);
      await shell(`git fetch ${repoUrl} && git reset --hard origin/${branch} && git clean -f -d`);
    } catch (e) {
      log(`Error pulling from branch ${branch}: ${e.stack}`);
      await shell(`rm -rf ${repoDir}`);
      await shell(`mkdir -p ${repoDir}`);
      await shell(`git clone ${repoUrl} --branch ${branch} ${repoDir}`);
    }
  } else {
    log(`Repodir ${repoDir} does not exist, creating it...`);
    await shell(`rm -rf ${repoDir}`);
    await shell(`mkdir -p ${repoDir}`);
    await shell(`git clone ${repoUrl} --branch ${branch} ${repoDir}`);
  }

  const buildCompose = `${repoDir}/docker-compose.yml`;
  let targetCompose = `${destPath}/docker-compose-${repo}.yml`;
  log(`Building at ${buildCompose}...`);
  await shell(`docker-compose -f ${buildCompose} build`, {timeout: 60*60*1000});
  // Move the build image tag to the compose used to up the DNP
  // If destination compose does not exist
  if (!(await exists(targetCompose))) {
    log(`Target compose ${targetCompose} does not exist. Using the build compose to up the DNP`);
    targetCompose = buildCompose;
  } else {
    try {
      editCompose.moveImage(buildCompose, targetCompose);
    } catch (e) {
      log(`Error editing compose: ${e.stack}`);
      targetCompose = buildCompose;
    }
  }
  // Up
  log(`Up-ing ${targetCompose}...`);
  await shell(`docker-compose -f ${targetCompose} up -d`);
  log(`Successfully updated ${user}/${repo}:${branch}`);
}

module.exports = updateRepo;
