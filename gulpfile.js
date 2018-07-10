// var gulp = require("gulp");
// var ts = require("gulp-typescript");
// var tsProject = ts.createProject("tsconfig.json");

// gulp.task("default", function () {
//     return tsProject.src()
//         .pipe(tsProject())
//         .js.pipe(gulp.dest("dist"));
// });

var gulp = require("gulp");
var browserify = require("browserify");
var watchify = require("watchify");
var source = require('vinyl-source-stream');
var gutil = require("gulp-util");
var tsify = require("tsify");
var paths = {
    pages: ['src/*.html'],
    css: ['src/css/*.css']
};

var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['src/simpleWorld.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

// Gulp task to concatenate our css files
gulp.task('copy-css', function () {
   return gulp.src(paths.css)
       .pipe(gulp.dest('dist/css'))
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
}

gulp.task("default", ["copy-html", "copy-css"], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);