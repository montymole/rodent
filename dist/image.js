"use strict";
/**
 * Carve png image using spiral path
 * input parameters are read from project.json
 * TODO: enable zoom and pan different areas of source image
 * TODO: enable multiple spiral configurations in one project
 * TODO: export as multiple gcode files
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tpl_1 = require("./tpl");
var Promise = require("bluebird");
var PNG = require("png-js");
var fs = require("fs");
var program = new tpl_1.default();
var METRIC = program.METRIC, cut = program.cut, rapid = program.rapid, units = program.units, tool = program.tool, feed = program.feed, speed = program.speed, dwell = program.dwell;
var projectFile = process.argv[2];
var outFile = process.argv[3];
if (!projectFile || !outFile) {
    console.log('Args should be: node image.js <project.json> <output.gcode>');
    process.exit();
}
console.log('Loading...', projectFile);
loadProject(projectFile)
    .then(function (options) {
    console.log(options);
    return Promise.all([
        options,
        loadImage(options.image)
    ]);
})
    .spread(function (options, image) {
    var _a = options, _b = _a.zSafe, zSafe = _b === void 0 ? 1 : _b, _c = _a.cutDepth, cutDepth = _c === void 0 ? -1 : _c, _d = _a.ymax, ymax = _d === void 0 ? 100 : _d, _e = _a.xmax, xmax = _e === void 0 ? 100 : _e, _f = _a.imageCenter, imageCenter = _f === void 0 ? { x: 0, y: 0 } : _f, //0% top left corner
    _g = _a.imageZoom //100%
    , //0% top left corner
    imageZoom = _g === void 0 ? 100 : _g //100%
    ;
    units(METRIC); // units
    if (options.tool)
        tool(options.tool); //select tool
    feed(10); //set feed rate to mm/second
    var iC = {
        x: (xmax / 100) * imageCenter.x,
        y: (ymax / 100) * imageCenter.y //TODO
    };
    var iZ = 100 / imageZoom;
    spiral(xmax, ymax, 5, -4, function (x, y) {
        return cutDepth - (getPixel(image, x, y, xmax, ymax) * cutDepth);
    });
    fs.writeFile(outFile, program.output(), function (err) {
        if (err) {
            console.error(err);
        }
        console.log('saved...');
    });
})
    .catch(function (err) {
    console.error(err);
});
function loadProject(file) {
    return new Promise(function (resolve, reject) {
        var contents = fs.readFileSync(file);
        resolve(JSON.parse(contents.toString()));
    });
}
function loadImage(imagePath) {
    console.log('Loading image...', imagePath);
    return new Promise(function (resolve, reject) {
        var image = PNG.load(imagePath);
        image.decode(function (pixels) {
            image.pixels = pixels;
            resolve(image);
        });
    });
}
function getPixel(image, rx, ry, rw, rh) {
    var xa = image.width / rw;
    var ya = image.height / rh;
    var x = Math.round(xa * rx);
    var y = Math.round(ya * ry);
    var pI = ((y * image.width) + x) * 4;
    var r = image.pixels[pI] || 0;
    var g = image.pixels[pI + 1] || 0;
    var b = image.pixels[pI + 2] || 0;
    var brightness = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    return brightness ? brightness : 0;
}
function spiral(xmax, ymax, zSafe, cutDepth, depthFn) {
    if (xmax === void 0) { xmax = 120; }
    if (ymax === void 0) { ymax = 120; }
    if (zSafe === void 0) { zSafe = 1; }
    if (cutDepth === void 0) { cutDepth = -1; }
    var c = { x: xmax / 2, y: ymax / 2, z: zSafe };
    var x2 = 1;
    var y2 = 1;
    var cutLen = 0.05;
    var cutWidth = 0.001;
    var s1 = 1;
    var x = 0;
    var y = 0;
    var nmax = 3600;
    var lastDepth = zSafe;
    rapid(c);
    var n2 = 0;
    for (var n = 0; n < nmax && s1 > 0 && (x >= 0 && y >= 0 && x <= xmax && y <= ymax); n += s1) {
        y = c.y + (c.y * n2 * Math.sin(n));
        x = c.x + (c.x * n2 * Math.cos(n));
        var depth = depthFn(x, y);
        var s2 = s1 * cutWidth;
        n2 += s2;
        s1 = cutLen / (Math.PI * 2 * n2);
        if (depth > 0.2 && lastDepth > 0.2) {
            rapid({ x: x, y: y, z: depth });
        }
        else {
            cut({ x: x, y: y, z: depth });
        }
        lastDepth = depth;
    }
}
