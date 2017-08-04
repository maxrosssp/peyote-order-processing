var Jimp = require('./extendedJimp');

var getClosestColor = function(matchColor, colorList) {
  if (colorList === null || colorList.length < 1 || !matchColor) {
    return '#afa0af';
  }

  colorList = colorList.slice();

  var distFunc = function(c1) {
    return Math.sqrt(Math.pow(matchColor[0] - c1[0], 2) + Math.pow(matchColor[1] - c1[1], 2) + Math.pow(matchColor[2] - c1[2], 2));
  };

  colorList.sort(function(c1, c2) {
    return distFunc(c1) - distFunc(c2);
  });

  return colorList[0];
}

var getClosestPalette = function(palette, colorOptions) {
  return palette.map(function(color) {
    return getClosestColor(color, colorOptions);
  });
};

var componentToHex = function(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

var rgbToHex = function(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
};

function hexToRgb(hex) {
  var result = Jimp.intToRGBA(hex);

  return [result.r, result.g, result.b];
  // var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  // return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

module.exports = {
  getClosestColor: getClosestColor,
  getClosestPalette: getClosestPalette,
  rgbToHex: rgbToHex,
  hexToRgb: hexToRgb
};