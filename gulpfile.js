var gulp = require("gulp");
var browserify = require("browserify");
var through = require("through2");
var less = require("less");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var watch = require("gulp-watch");

var options = {
	dir : "./src",
	dest : "./dist",
	target : "./src/index.js"
};

gulp.task("default", function () {

	var bundler = browserify({
        entries: [options.target],
        paths : [options.dir]
    });

	var lessDeps = [];

    // ignore less file scompletely. Build them separatly.
    bundler.transform( function (file) {
        // console.log("file",file);
        if (!/\.css$|\.less$/.test(file)) {
            return through();
        }
        
        var dir = path.dirname(file);
        lessDeps.push(file);
        var buffer = "";

        function write( chunk, enc, next ) {
            buffer += chunk.toString();
            next();
        }

        function end ( done ) {
            var transform = this;
            transform.push(null);
            done();
        }

        return through(write, end);
    });

    bundler.on("bundle", function (bundle) {
        bundle.on("end", function () {
            var masterLessFile = [];
             _.each(_.uniq(lessDeps.reverse()), function ( src ) {
                masterLessFile.push("@import (less) '");
                masterLessFile.push(src);
                masterLessFile.push("';");
                masterLessFile.push("\n");
             });
             less
                .render(masterLessFile.join(""), {
                    relativeUrls : true
                }, function ( err, output ) {
                    if ( err ) {
                        console.log("error", err);
                        next(err);
                    } else {
                        fs.writeFileSync(options.dest+"/bundle.css", output.css);
                    }
                });
        });
    });

    var bundle = function() {
        return bundler
            .bundle()
            .pipe(source("bundle.js"))
            .pipe(buffer())
            .pipe(gulp.dest(options.dest));
    };

    return bundle();

});

gulp.task("watch", function () {
	watch("./src/**/*.*", function () {
		console.log("rebundle...");
		gulp.start("default")
	});
});
