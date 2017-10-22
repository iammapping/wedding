module.exports = function(grunt) {
  var versionDate = new Date();
  var timestamp = versionDate.getTime();
  grunt.config.set('rename', {
    js: {
      src: '.tmp/public/min/production.min.js',
        dest: '.tmp/public/min/production.v'+timestamp+'.min.js'
    },
    css: {
      src: '.tmp/public/min/production.min.css',
        dest: '.tmp/public/min/production.v'+timestamp+'.min.css'
      }
  });
  grunt.loadNpmTasks('grunt-rename');
};
