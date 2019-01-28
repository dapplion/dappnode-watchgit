const yaml = require('yamljs');
const fs = require('fs');

// return yaml.dump(dcObject, { indent: 4 });
// return yaml.parse(dcString);

function getImage(dcPath) {
  const dcString = fs.readFileSync(dcPath, 'utf8');
  const dc = yaml.parse(dcString);
  return dc.services[Object.keys(dc.services)[0]].image;
}

function setImage(image, dcPath) {
  const dcString = fs.readFileSync(dcPath, 'utf8');
  const dc = yaml.parse(dcString);
  dc.services[Object.keys(dc.services)[0]].image = image;
  const newDcString = yaml.dump(dc, {indent: 4});
  fs.writeFileSync(dcPath, newDcString);
}

function moveImage(dcPathFrom, dcPathTo) {
  const image = getImage(dcPathFrom);
  setImage(image, dcPathTo);
}

module.exports = {
  getImage,
  setImage,
  moveImage,
};
