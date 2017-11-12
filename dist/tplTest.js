"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tpl_1 = require("./tpl");
var program = new tpl_1.default();
var METRIC = program.METRIC, icut = program.icut, cut = program.cut, rapid = program.rapid, units = program.units, tool = program.tool, feed = program.feed, speed = program.speed, dwell = program.dwell;
units(METRIC); // This must match the units of the DXF file
tool(1); //select tool
feed(123); //set feed rate to mm/second
speed(20000); //spin RPM 
dwell(50); // Wait for spindle to spin up
rapid({ z: 0, y: 0, x: 0 });
cut({ z: -5, y: 0, x: 0 });
cut({ z: -5, y: 100, x: 200 });
icut({ x: -100 });
icut({ y: -10 });
icut({ x: -10 });
icut({ y: -90 });
program.output();
