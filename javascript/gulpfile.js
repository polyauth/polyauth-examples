var gulp = require('gulp');
var gutil = require('gulp-util');
var runseq = require('run-sequence');
var webserver = require('gulp-webserver');
var replace = require('gulp-replace');
var argv = require('yargs').argv;
var path = require('path');
var del = require('del');

const CONFIG = require(argv.config ? argv.config : '../config.json');
const APP_DIR = path.join(__dirname, '_app');

function copyAssests(dest) {
	return gulp
		.src(['bower_components/**', 'assets/**'])
		.pipe(gulp.dest(dest));
}

function serve(dest) {
	return gulp
		.src(dest)
		.pipe(webserver({
			port: 9000,
			https: {
				cert: path.join(__dirname, '..', 'priv', 'ssl', 'ex.crt'),
				key: path.join(__dirname, '..', 'priv', 'ssl', 'ex.key')
			}
		}));
}

function configure(options) {
	options = options || CONFIG;
	gutil.log(options);

	var replaceVariable =
		function(name, val) {
			var re = new RegExp("((?:var|const)\\s*" + name + "\\s*=\\s*').*((?:'|\\\"))");
			return replace(re, '$1' + val + '$2');
		}

	return gulp
		.src(path.join(APP_DIR, 'index.html'))
		.pipe(replaceVariable('REALM_ID', options.realm_id))
		.pipe(replaceVariable('REALM_SECRET', options.realm_secret))
		.pipe(replaceVariable('REDIRECT_URI', options.redirect_uri))
		.pipe(replaceVariable('APIV', options.apiv))
		.pipe(gulp.dest(APP_DIR));
}

gulp.task('app:html', function() {
	return gulp
		.src(['src/**/*.html'])
		.pipe(gulp.dest(APP_DIR));
});

gulp.task('app:assets', function() {
	return copyAssests(APP_DIR);
});

gulp.task('app:serve', function() {
	return serve(APP_DIR);
});

gulp.task('configure', function() {
	return configure();
});

gulp.task('watch', function() {
	gulp.watch('src/**/*.html', ['app:html']);
	gulp.watch('_app/index.html', ['configure']);
});

gulp.task('distclean', ['depsclean', 'clean']);

gulp.task('depsclean', function(cb) {
  del([
    path.join(__dirname, 'bower_components'),
    path.join(__dirname, 'node_modules')
	], cb);
});

gulp.task('clean', function(cb) {
	del([APP_DIR], cb);
});

gulp.task('app', ['app:assets', 'app:html']);

gulp.task('develop', function(cb) {
	runseq('app', 'configure', ['app:serve', 'watch'], cb);
});
