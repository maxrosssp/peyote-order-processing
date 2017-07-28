var async = require('asyncawait/async');
var await = require('asyncawait/await');

var TemplateBuilder = require("../../src/TemplateBuilder");
var Jimp = require("../../src/extendedJimp");

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

    var done = this.async();

    var imageName = 'test_3';
    var imagePath = './test/images/output/tryPixelate_5.jpg';

    Jimp.read(imagePath)
    .then(function(image) {
      console.log(image.bitmap.width + ' x ' + image.bitmap.height);

      Jimp.read('./src/assets/peyote_grid.png')
      .then(function(gridFragment) {
        console.log(gridFragment.bitmap.width + ' x ' + gridFragment.bitmap.height);

        var width = Math.round((image.bitmap.width / image.bitmap.height) * 649);

        var dimensions = beadDimensionsFromImgWidth[width];

        console.log(dimensions);

        var gridLayout = {
          columns: (dimensions.width / 6),
          rows: (dimensions.height / 2)
        };

        var gridFragmentSize = {
          width: ((dimensions.width * 10) / gridLayout.columns),
          height: ((dimensions.height * 14) / gridLayout.rows)
        };

        var newImageSize = {
          width: (gridFragmentSize.width * gridLayout.columns),
          height: (gridFragmentSize.height * gridLayout.rows)
        };

        gridFragment.resize(gridFragmentSize.width, gridFragmentSize.height, function(err, gridFragmentResize) {
          if (err) throwError.call(err, "couldn't resize grid fragment");

          new Jimp(newImageSize.width, newImageSize.height, function (err, blankImage) {
            if (err) throwError.call(err, "couldn't create new Jimp object");

            Array.from(Array(Math.round(gridLayout.columns)).keys()).reduce(function(image, position) {
              return image.composite(gridFragmentResize, gridFragmentSize.width * position, 0);
            }, blankImage).clone(function(err, gridRow) {
              if (err) throwError.call(err, "couldn't create grid row");

              Array.from(Array(Math.round(gridLayout.rows)).keys()).reduce(function(image, position) {
                return image.composite(gridRow, 0, gridFragmentSize.height * position);
              }, gridRow).clone(function(err, gridFiveRow) {
                if (err) throwError.call(err, "couldn't create 5 grid rows");

                image
                .resize(newImageSize.width, newImageSize.height)
                .composite(gridFiveRow, 0, 0)
                .write('./test/images/output/tryGrid_5.jpg');

                done();
              });
            });
          });
        });
      });
    })
    .catch(function(err) {
      console.log(err);

      done();
    });
  });

  grunt.registerTask('test_pixelate', 'test pixelate', function() {

    var done = this.async();

    var suspendable = async (function() {
      var imageName = 'test_3';
      var imagePath = './test/images/' + imageName + '.jpg';

      var image = await (Jimp.read(imagePath));

      console.log(image.bitmap.width + ' x ' + image.bitmap.height);

      var dimensions = beadDimensionsFromImgWidth[image.bitmap.width];

      var height = (14 * dimensions.height) - 1

      var resizedImage = await (image.resize(10 * dimensions.width, 14 * dimensions.height));

      var blankImage = await (new Jimp(10 * dimensions.width, 14 * dimensions.height));

      var t0 = await (resizedImage.clone().crop(0, 0, 30, height).pixelateRect(10, 14));
      var b1 = await (resizedImage.clone().crop(30, 7, 30, height).pixelateRect(10, 14));
      var t2 = await (resizedImage.clone().crop(60, 0, 30, height).pixelateRect(10, 14));
      var b3 = await (resizedImage.clone().crop(90, 7, 30, height).pixelateRect(10, 14));
      var t4 = await (resizedImage.clone().crop(120, 0, 30, height).pixelateRect(10, 14));
      var b5 = await (resizedImage.clone().crop(150, 7, 30, height).pixelateRect(10, 14));
      var t6 = await (resizedImage.clone().crop(180, 0, 30, height).pixelateRect(10, 14));
      var b7 = await (resizedImage.clone().crop(210, 7, 30, height).pixelateRect(10, 14));

      await (blankImage
      .composite(t0, 0, 0)
      .composite(b1, 30, 7)
      .composite(t2, 60, 0)
      .composite(b3, 90, 7)
      .composite(t4, 120, 0)
      .composite(b5, 150, 7)
      .composite(t6, 180, 0)
      .composite(b7, 210, 7)
      .write('./test/images/output/tryPixelate_5.jpg'));

      done();
    });

    suspendable();

  });
};