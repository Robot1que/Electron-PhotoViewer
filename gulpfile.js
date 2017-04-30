const config = {
    output: "dist",
    electron: "node_modules/electron/dist/**/*",
    tsConfig: "tsconfig.json",
    tsSource: "app/**/*.ts",
    tsOutput: "dist/resources/app",
    resources: [
        "app/**/*",
        "!app/**/*.ts",
        "!app/**/*.tsx",
    ],
    resourcesOutput: "dist/resources/app"
};

const gulp = require("gulp");
const del = require("del");
const ts = require("gulp-typescript");
const runSequence = require("run-sequence");
const util = require("gulp-util");

const logSuccess = function() {
    util.log(util.colors.green("SUCCESS!"));
};

gulp.task("clean", function(callback) {
    return del(config.output);
});

gulp.task("electron-copy", function() {
    return gulp.src(config.electron)
        .pipe(gulp.dest(config.output));
});

gulp.task("ts-compile", function() {
    const tsProject = ts.createProject(config.tsConfig);
    const tsResult = gulp.src(config.tsSource).pipe(tsProject());
    return tsResult.js.pipe(gulp.dest(config.tsOutput));
});

gulp.task("resources-copy", function() { 
    return gulp.src(config.resources)
        .pipe(gulp.dest(config.resourcesOutput));
});

gulp.task("build", function(callback) {
    runSequence(
        "clean", 
        "ts-compile",
        "electron-copy", 
        "resources-copy",
        //logSuccess,
        callback
    );
});