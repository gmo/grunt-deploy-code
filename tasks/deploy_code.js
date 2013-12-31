/*
 * grunt-deploy-code
 * https://github.com/jason/grunt-deploy-code
 *
 * Copyright (c) 2013 Jason Gill
 * Licensed under the MIT license.
 */

'use strict';
var http = require('http');
var querystring = require('querystring');

module.exports = function(grunt) {

    function deployToUsage() {
        grunt.log.writeln('USAGE: grunt deployTo:[environment]:[repoName]');
        grunt.log.writeln('  environment: This is required (i.e. production, staging, dev)');
        grunt.log.writeln('  repoName:    If not provided the package name will be used')
    }

    grunt.registerTask('deployTo', 'A task for deploying code', function(environment, repoName, branch) {

        if( !repoName ) {
            repoName = grunt.file.readJSON('package.json').name;
        }
		if( !branch ) {
			branch = "master";
		}

        if( !environment || !repoName ) {
            grunt.log.error('A required parameter is missing!');
            deployToUsage();
            return false;
        }

        try{
            grunt.task.run('preDeployment');
        }
        catch(err) {}

        grunt.task.run(['notifyDeploymentServer:' + environment + ':' + repoName + ':' + branch]);

        try{
            grunt.task.run('postDeployment');
        }
        catch(err) {}

    });

    grunt.registerTask(
        'notifyDeploymentServer',
        'Notifies a deployment server the latest build is ready to be deployed.',
        function(environment, repoName, branch) {

            var done = this.async();

            if( !environment || !repoName ) {
                grunt.log.error('A required parameter is missing!');
                deployToUsage();
                done(false);
            }

            var configFileName = 'deployTo.json';
            if( !grunt.file.exists(configFileName) ) {
                grunt.file.write(configFileName, '{ "[environment]": { "key": "12345", "host": "blah.domain.org", "port": "80" } }');
                grunt.log.error('Please edit the \'deployTo.json\' file with the desired environment settings!')
                done(false);
            }

            var config = grunt.file.readJSON(configFileName);
            if( !config[environment] ) {
                grunt.log.error('You need to add the environment \'' + environment + '\' to the \'' +configFileName + '\' file!')
                done(false);
            }
			if( !config[environment].key ) {
				grunt.log.error('You need to add \'key\' to the environment \'' + environment + '\' setting in the \'' +configFileName + '\' file!')
				done(false);
			}
            if( !config[environment].host ) {
                grunt.log.error('You need to add \'host\' to the environment \'' + environment + '\' setting in the \'' +configFileName + '\' file!')
                done(false);
            }
			if( !config[environment].port ) {
				grunt.log.error('You need to add \'port\' to the environment \'' + environment + '\' setting in the \'' +configFileName + '\' file!')
				done(false);
			}

            var host = config[environment].host;
			var port = config[environment].port;

			var data = querystring.stringify({
				key: config[environment].key,
				env: environment,
				repo: repoName,
				branch: branch
			});

			var options = {
				host: host,
				port: port,
				path: '/deploy',
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(data)
				}
			};

			var req = http.request(options, function(response) {
				var statusCode = (response.statusCode);
				if( statusCode != 200 ) {
					grunt.log.error('Error: Deployment server returned the following HTTP status - \'' + statusCode + '\'');
					done(false);
				}
				done();
			});
			req.on('error', function(e) {
				grunt.log.error('Error: Communication with deployment server failed! - ' + e.message);
				done(false);
			});

			req.write(data);
			req.end();
		});

};
