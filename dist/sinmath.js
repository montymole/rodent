"use strict";
/*
 * Test carve some math function
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tpl_1 = require("./tpl");
var program = new tpl_1.default();
var METRIC = program.METRIC, cut = program.cut, rapid = program.rapid, units = program.units, tool = program.tool, feed = program.feed, speed = program.speed, dwell = program.dwell;
var zSafe = 5;
var cutDepth = -1.5;
units(METRIC); //units
tool(1); //select tool
feed(100); //set feed rate to mm/second
speed(10000); //spin RPM 
dwell(10); // Wait for spindle to spin up
var ymax = 20;
var xmax = 20;
var c = { x: xmax / 2, y: ymax / 2, z: zSafe };
var x2 = 1;
var y2 = 1;
var s1 = 0.1;
var s2 = 0.003;
var m = 12;
var x = 0;
var y = 0;
var nmax = 360;
rapid(c);
var n2 = 0;
for (var n = 0; n < nmax; n += s1) {
    x2 = Math.abs(c.x - x);
    y2 = Math.abs(c.y - y);
    var depth = -4 + 2 * Math.abs(Math.sin(x2 / m) + Math.sin(y2 / (m * 2)) + Math.sin(Math.sqrt(x2 * x2 + y2 * y2) / m * 2));
    n2 += s2;
    x = c.y - (c.y * n2 * Math.sin(n));
    y = c.x + (c.x * n2 * Math.cos(n));
    cut({ x: x, y: y, z: depth });
}
program.output();
