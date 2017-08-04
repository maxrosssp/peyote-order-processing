var async = require('asyncawait/async');
var await = require('asyncawait/await');

var ColorThief = require('color-thief-jimp');

var TemplateBuilder = require("../../src/TemplateBuilder");
var Jimp = require("../../src/extendedJimp");

var pxImagePath = './test/images/test_6.jpg';
var pxImage = './test/images/output/tryPixelate_4.jpg';
var gridImage = './test/images/output/tryGrid_4.jpg';


var beadDimensionsFromImgWidth = {
  '119': {width:24, height:93.5}, '111': {width:24, height:100.5}, '103': {width:24, height:107.5}, '97' : {width:24, height:114.5}, '92' : {width:24, height:121.5}, '86' : {width:24, height:129.5}, '82' : {width:24, height:136.5},
  '134': {width:27, height:93.5}, '125': {width:27, height:100.5}, '116': {width:27, height:107.5},  '109': {width:27, height:114.5}, '103': {width:27, height:121.5}, '97' : {width:27, height:129.5}, '92' : {width:27, height:136.5},
  '149': {width:30, height:93.5}, '138': {width:30, height:100.5}, '129': {width:30, height:107.5}, '121': {width:30, height:114.5}, '114': {width:30, height:121.5}, '107': {width:30, height:129.5}, '102': {width:30, height:136.5}
};

var files = {
  'test_1': {

  },
  'test_2': {

  },
  'test_3': {

  }
};

module.exports = function(grunt) {
  grunt.registerTask('test_grid', 'test grid', function() {
    var fixedTemplateHeight = 649;

    var beadPixelWidth = 10;
    var beadPixelHeight = 14;
    var beadsPerColumn = 3;

    var gridFragmentColumns = 2;
    var gridFragmentRows = 2;

    var done = this.async();

    var suspendable = async (function() {
      var image = await (Jimp.read(pxImage));
      var gridFragment = await (Jimp.read('./src/assets/peyote_grid.png'));

      var dimensions = beadDimensionsFromImgWidth[Math.round((image.bitmap.width / image.bitmap.height) * fixedTemplateHeight)];

      var gridLayout = {columns: (dimensions.width / (beadsPerColumn * gridFragmentColumns)), rows: (dimensions.height / gridFragmentRows)};
      var gridFragmentSize = {width: ((dimensions.width * beadPixelWidth) / gridLayout.columns), height: ((dimensions.height * beadPixelHeight) / gridLayout.rows)};
      var newImageSize = {width: (gridFragmentSize.width * gridLayout.columns), height: (gridFragmentSize.height * gridLayout.rows)};

      var gridFragmentResize = await (gridFragment.resize(gridFragmentSize.width, gridFragmentSize.height));
      var blankImage = await (new Jimp(newImageSize.width, newImageSize.height));

      var gridRow = await (Array.from(Array(Math.round(gridLayout.columns)).keys()).reduce(function(image, position) {
        return image.composite(gridFragmentResize, gridFragmentSize.width * position, 0);
      }, blankImage));

      var gridFull = await (Array.from(Array(Math.round(gridLayout.rows)).keys()).reduce(function(image, position) {
        return image.composite(gridRow, 0, gridFragmentSize.height * position);
      }, gridRow));

      await (image
      .resize(newImageSize.width, newImageSize.height)
      .composite(gridFull, 0, 0)
      .write(gridImage));

      done();
    });

    suspendable();
  });

  grunt.registerTask('test_pixelate', 'test pixelate', function() {
    var beadPixelWidth = 10;
    var beadPixelHeight = 14;
    var beadsPerColumn = 3;

    var colorCount = 20;


    var done = this.async();

    var suspendable = async (function() {
      var image = await (Jimp.read(pxImagePath));

      var dimensions = beadDimensionsFromImgWidth[image.bitmap.width];

      var width = beadPixelWidth * dimensions.width;
      var height = beadPixelHeight * dimensions.height;

      var resizedImage = await (image.resize(width, height));

      var palette = await (ColorThief.getPalette(resizedImage, colorCount));

      var columnGroups = [];
      var columnGroupCount = dimensions.width / beadsPerColumn;
      var columnGroupWidth = beadPixelWidth * beadsPerColumn;

      for (var i = 0; i < columnGroupCount; i++) {
        var columnGroup = await (resizedImage
                                 .clone()
                                 .crop(i * columnGroupWidth, (i % 2 === 0) ? 0 : (beadPixelHeight / 2), columnGroupWidth, height - 1)
                                 .peyotePixelate(beadPixelWidth, beadPixelHeight, palette));

        columnGroups.push(columnGroup);
      }

      var blankImage = await (new Jimp(width, height));

      var image = await (columnGroups.reduce(function(image, columnGroup, index) {
        return image.composite(columnGroup, index * columnGroupWidth, (index % 2 === 0) ? 0 : (beadPixelHeight / 2));
      }, blankImage));

      await (image.write(pxImage));

      done();
    });

    suspendable();
  });

  grunt.registerTask('test_build', 'test build', function() {
    var done = this.async();

    TemplateBuilder.build('./test/images/test_1.jpg', 20, 3)
    .then(function(image) {
      return image.write('./test/output/build_1.jpg');
    }).then(function() {
      done();
    });
  });
};


















