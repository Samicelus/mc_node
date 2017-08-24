//动态加载器
var fs = require('fs');
var path = require('path');

function dispatchImporter() {
    function importer(from) {
        from = path.relative(process.cwd(),from);
        var imported = {};
        var joinPath = function() {
            return process.cwd()+path.sep+path.join.apply(path, arguments);
        };
        var fsPath = joinPath(from);
        fs.readdirSync(fsPath).forEach(function(name) {
            var info = fs.statSync(path.join(fsPath, name));
            if (info.isDirectory()) {
                imported[name] = importer(joinPath(from, name));
            } else {
                var ext = path.extname(name);
                var base = path.basename(name, ext);
                if (require.extensions[ext]) {
                    imported[base] = require(path.join(fsPath, name));
                } else {
                    console.log('cannot require '+name);
                }
            }
        });
        return imported;
    }
    return importer;
}

module.exports = dispatchImporter;