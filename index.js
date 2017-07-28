var AWS = require('aws-sdk');
var TemplateBuilder = require('./src/templateBuilder');

exports.handler = function(event, context) {

  TemplateBuilder.build('./test/images/test_1.jpg', 6);
};
