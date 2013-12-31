/*
 * grunt-deploy-code
 * https://github.com/jason/grunt-deploy-code
 *
 * Copyright (c) 2013 Jason Gill
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'test/*_test.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp']
		},

		mochaTest: {
			all: {
				options: {
					reporter: 'spec'
				},
				src: ['test/*_test.js']
			}
		}

	});

	grunt.registerTask('init', function() {
		grunt.log.writeln('Running init...');
		return true;
	});
	grunt.registerTask('phpunit', function() {
		grunt.log.writeln('Running phpunit tests...');
		return true;
	});
	grunt.registerTask('mocha', function() {
		grunt.log.writeln('Running mocha tests...');
		return true;
	});
	grunt.registerTask('cleanUp', function() {
		grunt.log.writeln('Running clean up...');
		return true;
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-mocha-test');

	// Tasks
	grunt.registerTask('build', ['clean', 'jshint']);
	grunt.registerTask('default', ['build', 'mochaTest']);


	grunt.registerTask('runTests', ['phpunit', 'mocha']);

	grunt.registerTask('preDeployment', ['init', 'runTests']);
	grunt.registerTask('postDeployment', ['cleanUp']);

	//grunt.registerTask('deployToProd', ['deployCodeTo:prod:sandbox']);

};
