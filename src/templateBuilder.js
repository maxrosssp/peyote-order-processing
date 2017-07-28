var Jimp = require("jimp");
var ColorThief = require('color-thief-jimp');

var BEAD = {height: 14, width: 10};

var beadDimensionsFromImgWidth = {
  '119': {width:24, height:93.5}, '111': {width:24, height:100.5}, '103': {width:24, height:107.5}, '97' : {width:24, height:114.5}, '92' : {width:24, height:121.5}, '86' : {width:24, height:129.5}, '82' : {width:24, height:136.5},
  '134': {width:27, height:93.5}, '125': {width:27, height:100.5}, '116': {width:27, height:107.5},  '109': {width:27, height:114.5}, '103': {width:27, height:121.5}, '97' : {width:27, height:129.5}, '92' : {width:27, height:136.5},
  '149': {width:30, height:93.5}, '138': {width:30, height:100.5}, '129': {width:30, height:107.5}, '121': {width:30, height:114.5}, '114': {width:30, height:121.5}, '107': {width:30, height:129.5}, '102': {width:30, height:136.5}
};

var getColorPalette = function(image, colorCount) {
  return ColorThief.getPalette(image, colorCount);
};

var getTemplatePixelDimensions = function(image) {
  var beadDimensions = beadDimensionsFromImgWidth[image.width];

  return {height: beadDimensions.height * BEAD.height, width: beadDimensions.width * BEAD.width};
};

var build = function(imagePath, colorCount) {
  console.log('1');

	Jimp.read(imagePath)
	.then(function(image) {
    var templateSize = getTemplatePixelDimensions(image);
    var colorPalette = getColorPalette(image, colorCount);


    image.resize(templateSize.width, templateSize.height)
         .clone().pixelate(20)
         .write("./test/output/output.jpg");

	})
	.catch(function(err) {
		console.error(err);
	});
};

module.exports = {
  build: build
};
