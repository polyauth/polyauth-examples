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

	var elements = path.join(APP_DIR, 'elements');
	var replaceProperty =
		function(name, val) {
			var re = new RegExp("(" + name + "\\s*:\\s*{(?:.|[\\r\\n])*?value\\s*:\\s*(?:'|\\\")).*?((?:'|\\\")(?:.|[\\r\\n])*?})");
			return replace(re, '$1' + val + '$2');
		}

	return gulp
		.src(path.join(elements, 'ex-app.html'))
		.pipe(replaceProperty('realmId', options.realm_id))
		.pipe(replaceProperty('redirectUri', options.redirect_uri))
		.pipe(replaceProperty('apiv', options.apiv))
		.pipe(gulp.dest(elements));
}

gulp.task('app:html', function() {
	return gulp
		.src(['src/**/*.html'])
		.pipe(gulp.dest(APP_DIR));
});

gulp.task('app:css', function() {
	return gulp
		.src(['src/**/*.css'])
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
	gulp.watch('src/**/*.css', ['app:css']);
	gulp.watch('_app/elements/ex-app.html', ['configure']);
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

gulp.task('app', ['app:assets', 'app:html', 'app:css']);

gulp.task('develop', function(cb) {
	runseq('app', 'configure', ['app:serve', 'watch'], cb);
});
