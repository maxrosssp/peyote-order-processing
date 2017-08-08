module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-compress');

  // require('load-grunt-tasks')(grunt);

  require('./test/tasks/testPixelate')(grunt);

  grunt.initConfig({
    compress: {
      main: {
        options: {
          archive: 'peyote-order-processing.zip'
        },
        files: [
          {src: ['src/**', 'node_modules/**', 'index.js'], dest: '/'}
        ]
      }
    }
  });

  grunt.registerTask('test', ['test_pixelate', 'test_grid']);

  grunt.registerTask('build', ['test_build']);

  grunt.registerTask('package', ['compress']);
};