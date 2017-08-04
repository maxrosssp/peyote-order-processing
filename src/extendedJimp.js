var PeyotePalette = require('./peyotePalette');
var Jimp = require("jimp");
var CONFIG = require('./templateConfig');

Jimp.prototype.getBeadSpecs = function (templateBeadSize) {
  var width = this.bitmap.width;
  var height = this.bitmap.height;

  return {
    width: width / templateBeadSize.width,
    height: height / templateBeadSize.height
  };
};

function applyKernel (im, kernel, x, y) {
  let value = [0, 0, 0];
  let size = (kernel.length - 1) / 2;

  for (var kx = 0; kx < kernel.length; kx += 1) {
      for (var ky = 0; ky < kernel[kx].length; ky += 1) {
          var idx = im.getPixelIndex(x + kx - size, y + ky - size);
          value[0] += im.bitmap.data[idx] * kernel[kx][ky];
          value[1] += im.bitmap.data[idx + 1] * kernel[kx][ky];
          value[2] += im.bitmap.data[idx + 2] * kernel[kx][ky];
      }
  }
  return value;
}

function isNodePattern (cb) {
  if (typeof cb === "undefined") return false;
  if (typeof cb !== "function")
      throw new Error("Callback must be a function");
  return true;
}

Jimp.prototype.peyoteAbsoluteScale = function (f, templateBeadSize, mode, cb) {
    if ("number" != typeof f)
        return throwError.call(this, "f must be a number", cb);
    if (f < 0)
        return throwError.call(this, "f must be a positive number", cb);

    if ("function" == typeof mode && "undefined" == typeof cb) {
        cb = mode;
        mode = null;
    }

    var w = (CONFIG.sizes.baseBeadSpecs.width * f) * templateBeadSize.width;
    var h = (CONFIG.sizes.baseBeadSpecs.height * f) * templateBeadSize.height;

    this.resize(w, h, mode);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

Jimp.prototype.peyotePixelate = function(pixel_w, pixel_h, palette, cb) {

    if ("function" == typeof palette) {
      cb = palette;
    } else {
      if ("number" != typeof pixel_w) return throwError.call(this, "pixel_w must be a number", cb);
      if ("number" != typeof pixel_h) return throwError.call(this, "pixel_h must be a number", cb);
    }

    var kernel = [
        [1 / 16, 2 / 16, 1 / 16],
        [2 / 16, 4 / 16, 2 / 16],
        [1 / 16, 2 / 16, 1 / 16]
    ];

    var source = this.clone();
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (xx, yx, idx) {

        xx = (pixel_w * Math.floor(xx / pixel_w)) + Math.round(pixel_w / 2);
        yx = (pixel_h * Math.floor(yx / pixel_h)) + Math.round(pixel_h / 2);

        var value = applyKernel(source, kernel, xx, yx);

        var bestMatch = palette ? PeyotePalette.getClosestColor(value, palette) : value;

        this.bitmap.data[idx] = bestMatch[0];
        this.bitmap.data[idx + 1] = bestMatch[1];
        this.bitmap.data[idx + 2] = bestMatch[2];
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

Jimp.prototype.peyoteNumber = function(pixel_w, pixel_h, palette, cb) {

    if ("function" == typeof palette) {
      cb = palette;
    } else {
      if ("number" != typeof pixel_w) return throwError.call(this, "pixel_w must be a number", cb);
      if ("number" != typeof pixel_h) return throwError.call(this, "pixel_h must be a number", cb);
    }

    var colorMap = {};

    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function(font) {

      this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
          center_x = (pixel_w * Math.floor(x / pixel_w)) + Math.round(pixel_w / 2);
          center_y = (pixel_h * Math.floor(y / pixel_h)) + Math.round(pixel_h / 2);

          var pixelColor = this.getPixelColor(center_x, center_y);

          if (!colorMap[pixelColor]) {
            colorMap[pixelColor] = Object.keys(colorMap) + 1;
          }

          this.print(font, x, y, colorMap[pixelColor] + '', pixel_w);
      });
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

module.exports = Jimp;









