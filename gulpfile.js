const gulp = require('gulp');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemap = require('gulp-sourcemaps');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
// const svgstore = require('gulp-svgstore');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const del = require('del');
const server = require('browser-sync').create();

gulp.task('css', () => gulp.src('source/less/style.less')
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(less())
  .pipe(postcss([autoprefixer()]))
  .pipe(gulp.dest('build/css'))
  .pipe(csso())
  .pipe(rename('style.min.css'))
  .pipe(sourcemap.write('.'))
  .pipe(gulp.dest('build/css'))
  .pipe(server.stream()));

gulp.task('images', () => gulp.src('source/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({ optimizationLevel: 3 }),
    imagemin.jpegtran({ progressive: true }),
    imagemin.svgo(),
  ]))
  .pipe(gulp.dest('source/img')));

gulp.task('webp', () => gulp.src('source/img/**/*.{png,jpg}')
  .pipe(webp({ quality: 90 }))
  .pipe(gulp.dest('source/img')));

gulp.task('html', () => gulp.src('source/*.html')
  .pipe(posthtml([
    include(),
  ]))
  .pipe(gulp.dest('build')));

gulp.task('refresh', (done) => {
  server.reload();
  done();
});

gulp.task('copy', () => gulp.src([
  'source/img/**/*',
  'source/js/**/*',
], {
  base: 'source',
})
  .pipe(gulp.dest('build')));

gulp.task('server', () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/less/**/*.less', gulp.series('css'));
  gulp.watch('source/img/icon-*.svg', gulp.series('html', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
  gulp.watch('source/js/**/*.js', gulp.series('copy', 'html', 'refresh'));
});

gulp.task('clean', () => del('build'));

gulp.task('build', gulp.series('clean', 'copy', 'css', 'html'));
gulp.task('start', gulp.series('build', 'server'));
