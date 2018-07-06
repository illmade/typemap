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
    pages: ['src/*.html']
};

var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['src/main.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
}

gulp.task("default", ["copy-html"], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);