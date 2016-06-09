var path = require('path'),
	webpackConfig = require('./webpack.config'),
	argv = require('yargs').argv;

module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai'],
		webpack: webpackConfig,
		webpackServer: {
			noInfo: true
		},
		basePath: '',
		files: [
			'tests.webpack.js'
		],
		preprocessors: {
			'tests.webpack.js': ['webpack', 'sourcemap']
		},
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		browsers: ['PhantomJS'],
		concurrency: Infinity,
		reporters: ['spec'],
		singleRun: !argv.watch,
		plugins: [
			'karma-mocha',
			'karma-chai',
			'karma-webpack',
			'karma-phantomjs-launcher',
			'karma-spec-reporter',
			'karma-sourcemap-loader'
		],
	});
}