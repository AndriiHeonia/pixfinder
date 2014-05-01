var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var scripts = ['./src/**/*.js', './src/*.js'];

// Lint & Concat & Minify JS
gulp.task('build', function(){
    gulp.src(scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
  gulp.watch(scripts, ['build']);
});

gulp.task('default', ['build', 'watch']);