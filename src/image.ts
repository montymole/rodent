/**
 * Carve png image using spiral path
 * input parameters are read from project.json
 * TODO: enable zoom and pan different areas of source image
 * TODO: enable multiple spiral configurations in one project
 * TODO: export as multiple gcode files
 */

import TPL from './tpl';
import * as Promise from 'bluebird';
import * as PNG from 'png-js';
import * as fs from 'fs';

const program = new TPL();
const { METRIC, cut, rapid, units, tool, feed, speed, dwell } = program;
const projectFile = process.argv[2];
const outFile = process.argv[3];
if (!projectFile || !outFile) {
    console.log('Args should be: node image.js <project.json> <output.gcode>');
    process.exit();
}
console.log('Loading...', projectFile);
loadProject(projectFile)
    .then(options => {
        console.log(options);
        return Promise.all([
            options,
            loadImage((<any>options).image)
        ]);
    })
    .spread((options, image) => {
        const {
            zSafe = 1,
            cutDepth = -1,
            ymax = 100,
            xmax = 100,
            imageCenter = { x: 0, y: 0 }, //0% top left corner
            imageZoom = 100 //100%
        } = <any>options;
        units(METRIC); // units
        if ((<any>options).tool) tool((<any>options).tool); //select tool
        feed(10);  //set feed rate to mm/second
        const iC = {
            x: (xmax / 100)*imageCenter.x, //TODO
            y: (ymax / 100)*imageCenter.y //TODO
        }
        const iZ = 100/imageZoom;
        spiral(xmax, ymax, 5, -4, (x, y) => {
            return cutDepth - (getPixel(image, x, y, xmax, ymax) * cutDepth);
        });
        fs.writeFile(outFile, program.output(), (err) => {
            if (err) {
                console.error(err);
            }
            console.log('saved...');
        });
    })
    .catch(err => {
        console.error(err);
    });

function loadProject(file) {
    return new Promise((resolve, reject) => {
        const contents = fs.readFileSync(file);
        resolve(JSON.parse(contents.toString()));
    })
}

function loadImage(imagePath) {
    console.log('Loading image...', imagePath);
    return new Promise((resolve, reject) => {
        const image = (<any>PNG).load(imagePath);
        image.decode(pixels => {
            image.pixels = pixels;
            resolve(image);
        });
    });
}

function getPixel(image, rx, ry, rw, rh) {
    const xa = image.width / rw;
    const ya = image.height / rh;
    const x = Math.round(xa * rx);
    const y = Math.round(ya * ry);
    const pI = ((y * image.width) + x) * 4;
    const r = image.pixels[pI] || 0;
    const g = image.pixels[pI + 1] || 0;
    const b = image.pixels[pI + 2] || 0;
    const brightness = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    return brightness ? brightness : 0;
}

function spiral(xmax = 120, ymax = 120, zSafe = 1, cutDepth = -1, depthFn) {
    var c = { x: xmax / 2, y: ymax / 2, z: zSafe }
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
        } else {
            cut({ x: x, y: y, z: depth });
        }
        lastDepth = depth;
    }
}

