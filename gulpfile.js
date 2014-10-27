var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    browserify = require('gulp-browserify');

gulp.task('lint', function() {
    gulp.src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', ['lint'], function(){
    gulp.src(['./src/pixfinder.js'])
        .pipe(browserify({standalone: 'pix'}))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('pixfinder.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
    gulp.watch(['./src/**/*.js', './src/*.js'], ['build']);
});

gulp.task('default', ['build', 'watch']);