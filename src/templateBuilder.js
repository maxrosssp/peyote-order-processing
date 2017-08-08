var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Jimp = require('./extendedJimp');
var ColorThief = require('color-thief-jimp');

var PeyotePalette = require('./peyotePalette');
var CONFIG = require('./templateConfig');

var BASE_BEAD = CONFIG.sizes.baseBeadSpecs;
var FIXED_TEMPLATE_HEIGHT = CONFIG.sizes.fixedTemplateHeight;
var FIXED_WIDTH_BEAD_DIMENSIONS = CONFIG.sizes.beadDimensionsFromFixedWidth;
var GRID_FRAGMENTS = CONFIG.gridFragments;

var TEMPLATE_BEAD_SIZE;

var getDelicaPalette = async (function(image, colorCount) {
  var palette = await (ColorThief.getPalette(image, colorCount));

  return PeyotePalette.getClosestPalette(palette, CONFIG.colors.options);
});

var peyotePixelateImage = async (function(image, palette, beadsPerColumnGroup) {
  var beadSpecs = image.getBeadSpecs(TEMPLATE_BEAD_SIZE);

  var columnGroupWidth = beadSpecs.width * beadsPerColumnGroup;
  var columnGroupsCount = TEMPLATE_BEAD_SIZE.width / beadsPerColumnGroup;

  var columnGroups = [];
  for (var i = 0; i < columnGroupsCount; i++) {
    var columnGroup = await (image.clone()
                             .crop(i * columnGroupWidth, (i % 2 === 0) ? 0 : (beadSpecs.height / 2), columnGroupWidth, image.bitmap.height - (beadSpecs.height / 2))
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

    for (var j = 0; j < Math.floor(TEMPLATE_BEAD_SIZE.height); j++) {
      y = j * beadSpecs.height;

      center_x = x + (beadSpecs.width / 2);
      center_y = y + (beadSpecs.height / 2);

      var pixelColor = columnGroup.getPixelColor(center_x, center_y);

      if (!colorMap[pixelColor]) {
        var nextNum = Object.keys(colorMap).length + 1;
        var nextNumberImage = await (Jimp.read('./src/assets/numbers/' + nextNum + '.png'));
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
                             .crop(i * columnGroupWidth, (i % 2 === 0) ? 0 : (beadSpecs.height / 2), columnGroupWidth, numberedImage.bitmap.height - (beadSpecs.height / 2)));

    colorMap = await (numberColumnGroup(columnGroup, colorMap, beadSpecs, beadsPerColumnGroup));

    columnGroups.push(columnGroup);
  }

  await (columnGroups.reduce(function(image, columnGroup, index) {
    return image.composite(columnGroup, index * columnGroupWidth, (index % 2 === 0) ? 0 : (beadSpecs.height / 2));
  }, numberedImage));

  return numberedImage;
});

var addGrid = async (function(image, beadsPerColumnGroup) {
  var beadSpecs = image.getBeadSpecs(TEMPLATE_BEAD_SIZE);

  var gridFragmentSpecs = GRID_FRAGMENTS[beadsPerColumnGroup];
  var gridFragment = await (Jimp.read(gridFragmentSpecs.path));

  var gridLayout = {columns: Math.ceil((TEMPLATE_BEAD_SIZE.width / beadsPerColumnGroup) / gridFragmentSpecs.columnGroups), rows: Math.floor(Math.ceil(TEMPLATE_BEAD_SIZE.height) / gridFragmentSpecs.rows)};
  var gridFragmentSize = {width: (beadSpecs.width * gridFragmentSpecs.columnGroups * beadsPerColumnGroup), height: beadSpecs.height * gridFragmentSpecs.rows};

  var gridFragmentResize = await (gridFragment.resize(gridFragmentSize.width, gridFragmentSize.height));
  
  var gridRow = await (new Jimp(image.bitmap.width, gridFragmentSize.height));
  for (var i = 0; i < gridLayout.columns; i++) {
    await (gridRow.composite(gridFragmentResize, gridFragmentSize.width * i, 0));
  }

  var gridFull = await (new Jimp(image.bitmap.width, image.bitmap.height));
  for (var i = 0; i < gridLayout.rows; i++) {
    await (gridFull.composite(gridRow, 0, gridFragmentSize.height * i));
  }

  await (image.composite(gridFull, 0, 0));

  return image;
});

var build = async (function(imageSrc, colorCount, beadsPerColumnGroup) {
  var image = await (Jimp.read(imageSrc));
  TEMPLATE_BEAD_SIZE = FIXED_WIDTH_BEAD_DIMENSIONS[Math.round((image.bitmap.width / image.bitmap.height) * FIXED_TEMPLATE_HEIGHT)];

  await (image.peyoteAbsoluteScale(1, TEMPLATE_BEAD_SIZE));

  var palette = await (getDelicaPalette(image, colorCount));
  var pixelizedImage = await (peyotePixelateImage(image, palette, beadsPerColumnGroup));

  var numberedImage = await (numberImage(pixelizedImage, palette, beadsPerColumnGroup));

  return await (addGrid(numberedImage, beadsPerColumnGroup));
});

module.exports = {
  build: build
};
