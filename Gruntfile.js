module.exports = function(grunt) {

  // require('load-grunt-tasks')(grunt);

  require('./test/tasks/testPixelate')(grunt);

  grunt.initConfig({

  });

  grunt.registerTask('test', ['test_pixelate', 'test_grid']);

  grunt.registerTask('build', ['test_build']);
};