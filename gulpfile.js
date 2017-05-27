'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect'); // local webserver
var open = require('gulp-open'); // open url in a web browser
var browserify = require('browserify');
var reactify = require('reactify'); // compiles JSX to JS
var source = require('vinyl-source-stream'); // use conventional text streams with gulp
var concat = require('gulp-concat');
var eslint = require('gulp-eslint'); // lint JS including JSX

var config = {
  port: 9005,
  devBaseUrl: 'http://localhost',
  paths: {
    html: './src/*.html',
    js: './src/**/*.js',
    css: [
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
    ],
    mainJs: './src/main.js',
    dist: './dist/'
  }
};

// start a local dev server
gulp.task('connect', function () {
  connect.server({
    root: ['dist'],
    port: config.port,
    base: config.devBaseUrl,
    livereload: true
  });
});

gulp.task('open', ['connect'], function () {
  gulp.src(config.paths.dist + 'index.html')
    .pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/' }))
});

gulp.task('watch', function () {
  gulp.watch(config.paths.html, ['html']);
  gulp.watch(config.paths.js, ['js']);
})

gulp.task('html', function () {
  gulp.src(config.paths.html)
    .pipe(gulp.dest(config.paths.dist))
    .pipe(connect.reload());
});

gulp.task('js', ['lint'], function () {
  browserify(config.paths.mainJs)
    .transform(reactify)
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(config.paths.dist + '/js'))
    .pipe(connect.reload());
});

gulp.task('css', function () {
  gulp.src(config.paths.css)
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('lint', function () {
  return gulp.src(config.paths.js)
    .pipe(eslint({ config: 'eslint.config.json' }))
    .pipe(eslint.format());
});

gulp.task('default', ['html', 'js', 'css', 'lint', 'open', 'watch']);