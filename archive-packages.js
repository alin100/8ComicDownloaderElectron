var package = require("./package.json");
var fs = require('fs');
var archiver = require('archiver');
var async = require('async');

function zipFolder(srcFolder, zipFilePath, callback) {
    var output = fs.createWriteStream(zipFilePath);
    var zipArchive = archiver('zip');

    output.on('close', function() {
        callback();
    });

    zipArchive.pipe(output);

    zipArchive.bulk([{
        cwd: srcFolder,
        src: ['**/*'],
        dest: "8ComicDownloader-Electron",
        expand: true
    }]);

    zipArchive.finalize(function(err, bytes) {
        if (err) {
            callback(err);
        }
    });
}

var parallelFuncs = {};
var folder = "./dist/";
var files = fs.readdirSync(folder);

files.forEach(function(file) {
    if (file.indexOf("8comic-downloader-electron-") === 0 && fs.statSync(folder + file).isDirectory()) {
        var zipFile = folder + file + "-v" + package.version + ".zip";
        parallelFuncs[zipFile] = function(callback) {
            zipFolder(folder + file, zipFile, function(err) {
                if (err) {
                    callback(err, false);
                } else {
                    callback(err, true);
                }
            });
        }
    }
}, this);

async.parallel(parallelFuncs, function(err, results) {
    console.log("Error: ", err);
    console.log("Results: ", results)
});