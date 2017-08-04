var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Jimp = require('./extendedJimp');
var ColorThief = require('color-thief-jimp');

var PeyotePalette = require('./peyotePalette');
var CONFIG = require('./templateConfig');

var BASE_BEAD = CONFIG.sizes.baseBeadSpecs;
var FIXED_TEMPLATE_HEIGHT = CONFIG.sizes.fixedTemplateHeight;
var FIXED_WIDTH_BEAD_DIMENSIONS = CONFIG.sizes.beadDimensionsFromFixedWidth;

var TEMPLATE_BEAD_SIZE;

var getDelicaPalette = async (function(image, colorCount) {
  var palette = await (ColorThief.getPalette(image, colorCount));

  return PeyotePalette.getClosestPalette(palette, CONFIG.colors.options);
});

var getImageSpecs = function() {

};

var peyotePixelateImage = async (function(image, palette, beadsPerColumnGroup) {
  var beadSpecs = image.getBeadSpecs(TEMPLATE_BEAD_SIZE);

  var columnGroupWidth = beadSpecs.width * beadsPerColumnGroup;
  var columnGroupsCount = TEMPLATE_BEAD_SIZE.width / beadsPerColumnGroup;

  var columnGroups = [];
  for (var i = 0; i < columnGroupsCount; i++) {
    var columnGroup = await (image.clone()
                             .crop(i * columnGroupWidth, (i % 2 === 0) ? 0 : (beadSpecs.height / 2), columnGroupWidth, image.bitmap.height - 1)
                             .peyotePixelate(beadSpecs.width, beadSpecs.height, palette));

    columnGroups.push(columnGroup);
  }

  var blankImage = await (new Jimp(image.bitmap.width, image.bitmap.height));

  return await (columnGroups.reduce(function(image, columnGroup, index) {
    return image.composite(columnGroup, index * columnGroupWidth, (index % 2 === 0) ? 0 : (beadSpecs.height / 2));
  }, blankImage));
});

var numberColumnGroup = async (function(columnGroup, colorMap, beadSpecs, beadsPerColumnGroup) {
  var blankImage = await (new Jimp(columnGroup.bitmap.width, columnGroup.bitmap.height));

  var x, y;
  for (var i = 0; i < beadsPerColumnGroup; i++) {
    x = i * beadSpecs.width;

    for (var j = 0; j < TEMPLATE_BEAD_SIZE.height; j++) {
      y = j * beadSpecs.height;

      center_x = x + (beadSpecs.width / 2);
      center_y = y + (beadSpecs.height / 2);

      var pixelColor = columnGroup.getPixelColor(center_x, center_y);

      if (!colorMap[pixelColor]) {
        var nextNum = Object.keys(colorMap).length + 1;

        var nextNumberImage = await (Jimp.read('./src/assets/numbers/prop' + nextNum + '.png'));

        nextNumberImage = await (nextNumberImage.resize(beadSpecs.width, beadSpecs.height));

        colorMap[pixelColor] = nextNumberImage;
      }

      await (blankImage.composite(colorMap[pixelColor], x, y));
    }
  }

  await (columnGroup.composite(blankImage, 0, 0));

  return colorMap;
});

var numberImage = async (function(image, palette, beadsPerColumnGroup) {
  var numberedImage = await (image.clone().peyoteAbsoluteScale(4, TEMPLATE_BEAD_SIZE));

  var beadSpecs = numberedImage.getBeadSpecs(TEMPLATE_BEAD_SIZE);

  var columnGroupWidth = beadSpecs.width * beadsPerColumnGroup;
  var columnGroupsCount = TEMPLATE_BEAD_SIZE.width / beadsPerColumnGroup;

  var colorMap = {};
  var columnGroups = [];
  for (var i = 0; i < columnGroupsCount; i++) {
    var columnGroup = await (numberedImage
                             .clone()
                             .crop(i * columnGroupWidth, (i % 2 === 0) ? 0 : (beadSpecs.height / 2), columnGroupWidth, numberedImage.bitmap.height - 1));

    colorMap = await (numberColumnGroup(columnGroup, colorMap, beadSpecs, beadsPerColumnGroup));

    columnGroups.push(columnGroup);
  }

  await (columnGroups.reduce(function(image, columnGroup, index) {
    return image.composite(columnGroup, index * columnGroupWidth, (index % 2 === 0) ? 0 : (beadSpecs.height / 2));
  }, numberedImage));

  return numberedImage;
});

var build = async (function(imagePath, colorCount, beadsPerColumnGroup) {
  var image = await (Jimp.read(imagePath));
  TEMPLATE_BEAD_SIZE = FIXED_WIDTH_BEAD_DIMENSIONS[Math.round((image.bitmap.width / image.bitmap.height) * FIXED_TEMPLATE_HEIGHT)];

  await (image.peyoteAbsoluteScale(1, TEMPLATE_BEAD_SIZE));

  var palette = await (getDelicaPalette(image, colorCount));
  var pixelizedImage = await (peyotePixelateImage(image, palette, beadsPerColumnGroup));

  return await (numberImage(pixelizedImage, palette, beadsPerColumnGroup));
});

module.exports = {
  build: build
};
