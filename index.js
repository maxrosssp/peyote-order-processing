var Jimp = require('./src/extendedJimp');

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var TemplateBuilder = require('./src/templateBuilder');

exports.handler = function(event, context, callback) {
  
  var bucket = event.Records[0].s3.bucket.name;
  var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  console.log('Bucket: ' + bucket);
  console.log('Key: ' + key);

  var lastDashIndex = key.lastIndexOf('-');
  var beadsPerColumnGroup = key.slice(lastDashIndex + 3, key.lastIndexOf('.'));
  var keyPrefix = key.slice(0, lastDashIndex);
  var colorCount = keyPrefix.slice(keyPrefix.lastIndexOf('-') + 3);

  console.log('bg: ' + beadsPerColumnGroup);
  console.log('cc: ' + colorCount);

  s3.getObject({
    Bucket: bucket,
    Key: key,
  }, function(err, data) {
    if (err) console.log(err);

    console.log(data);

    TemplateBuilder.build(data.Body, colorCount, beadsPerColumnGroup)
    .then(function(image) {
      image.getBase64(Jimp.AUTO, function(err, data) {
        if (err) console.log(err);
        
        console.log(data);

        s3.putObject({
          Body: new Buffer(data.replace(/^data:image\/\w+;base64,/, ""),'base64'),
          Bucket: "peyote-personal-orders",
          Key: 'processed/' + key
        }, function(err, data) {
          if (err) console.log(err);

          console.log(data);
        });
      });
    });
  })
};
