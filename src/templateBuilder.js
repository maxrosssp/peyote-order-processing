var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Jimp = require('./extendedJimp');
var ColorThief = require('color-thief-jimp');

var PeyotePalette = require('./peyotePalette');
var CONFIG = require('./templateConfig');

var BEAD = CONFIG.sizes.bead;
var FIXED_TEMPLATE_HEIGHT = CONFIG.sizes.fixedTemplateHeight;
var FIXED_WIDTH_BEAD_DIMENSIONS = CONFIG.sizes.beadDimensionsFromFixedWidth;

var peyotePixelateImage = async (function(image, palette, templateSize) {
  var columnGroupWidth = templateSize.columnGroup.width.pixels;

  var columnGroups = [];
  for (var i = 0; i < templateSize.width.columnGroups; i++) {
    var columnGroup = await (image.clone()
                             .crop(i * columnGroupWidth, (i % 2 === 0) ? 0 : (BEAD.height / 2), columnGroupWidth, templateSize.height.pixels - 1)
                             .peyotePixelate(BEAD.width, BEAD.height, palette));

    columnGroups.push(columnGroup);
  }

  var blankImage = await (new Jimp(templateSize.width.pixels, templateSize.height.pixels));

  var pixelImage = await (columnGroups.reduce(function(image, columnGroup, index) {
    return image.composite(columnGroup, index * columnGroupWidth, (index % 2 === 0) ? 0 : (BEAD.height / 2));
  }, blankImage));

  return await (pixelImage.peyoteNumber(BEAD.width, BEAD.height, palette));
});

var getDelicaPalette = async (function(image, colorCount) {
  var palette = await (ColorThief.getPalette(image, colorCount));

  return PeyotePalette.getClosestPalette(palette, CONFIG.colors.options);
});

var build = async (function(imagePath, colorCount, beadsPerColumnGroup) {
  var image = await (Jimp.read(imagePath));

  var templateBeadDimensions = FIXED_WIDTH_BEAD_DIMENSIONS[Math.round((image.bitmap.width / image.bitmap.height) * FIXED_TEMPLATE_HEIGHT)];
  var templateSize = {
    width: {beads: templateBeadDimensions.width, pixels: templateBeadDimensions.width * BEAD.width, columnGroups: templateBeadDimensions.width / beadsPerColumnGroup},
    height: {beads: templateBeadDimensions.height, pixels: templateBeadDimensions.height * BEAD.height},
    columnGroup: {
      width: {beads: beadsPerColumnGroup, pixels: beadsPerColumnGroup * BEAD.width}
    }
  };

  image = await (image.resize(templateSize.width.pixels, templateSize.height.pixels));

  var palette = await (getDelicaPalette(image, colorCount));

  return await (peyotePixelateImage(image, palette, templateSize));
});

module.exports = {
  build: build
};
