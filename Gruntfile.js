/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Clean up dumb artifacts/ghost files
    watch: {
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: ['src/**/*.js', 'spec/*.js'],
        tasks: ['jshint:src', 'jasmine', 'concat', 'uglify'],
      }
    },
    jshint: {
      gruntfile: ['Gruntfile.js'],
      src: ['src/**/*.js'],
      all: ['Gruntfile.js', 'src/**/*.js'],
      global: {
        angular: true,
      }
    },
    jasmine: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*.js',
        vendor: [
          'node_modules/angular/angular.js',
          'node_modules/angular-mocks/angular-mocks.js',
        ]
      }
    },
    concat: {
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/sang.js'
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      lib: {
        files: {
          'dist/sang.min.js': ['dist/sang.js']
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint:src', 'jasmine', 'concat', 'uglify']);
};

