const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');
const pug = require('gulp-pug');
const del = require('del');

//таск для сборки Pug файлов
gulp.task('pug', function (callback) {
    return gulp.src('./app/pug/pages/**/*.pug')

        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }))

        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.stream()) // обновление СSS после компиляции
    callback()
})

gulp.task('scss', function (callback) {
    return gulp.src('./app/scss/main.scss')

        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }))

        .pipe(sourcemaps.init())
        .pipe(scss({
            indentType: 'tab',
            indentWidth: 1,
            outputStyle: 'expanded'
        }))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 version']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream()) // обнновление HTML после компиляции
    callback();
});

// копирование изображение
gulp.task('copy:img', function (callback) {
    return gulp.src('./app/img/**/*.*')
        .pipe(gulp.dest('build/img/'))
    callback()
})

// копирование JS фалов
gulp.task('copy:js', function (callback) {
    return gulp.src('./app/js/**/*.*')
        .pipe(gulp.dest('build/js/'))
    callback()
})

gulp.task('watch', function () {

    // следим за картинками и скриптами, и обновляем браузер
    watch(['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload))
    // слежение за ScSS и компиляция в CSS
    watch('./app/scss/**/*.scss', gulp.parallel('scss'))

    // в случае если возникает проблема что gulp перезапускает сервер быстрее чем файл успевает сохраниться
    // watch('./app/scss/**/*.scss', function () {
    //     setTimeout(gulp.parallel('scss'), 1000)
    // })

    // слежение за PUG и сборка
    watch('./app/pug/**/*.pug', gulp.parallel('pug'))

    // следим за картинками и скриптами, и копируем их в build
    watch('./app/img/**/*.*', gulp.parallel('copy:img'))
    watch('./app/js/**/*.*', gulp.parallel('copy:js'))

});

// Задача для стратта сервера из папки app
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });
});

gulp.task('clean:build', function () {
    return del('./build/')
})

gulp.task('default', gulp.series(
    gulp.parallel('clean:build'),
    gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
    gulp.parallel('server','watch')
))