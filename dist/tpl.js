"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
var TPL = /** @class */ (function () {
    function TPL() {
        var _this = this;
        this.gcode = ['(generated with TPL class 1.0)'];
        this.coords = [{ X: 0, Y: 0, Z: 0 }];
        this.METRIC = 1;
        this.units = function (t) {
            _this.gcode.push(t === _this.METRIC ? 'G21' : 'G20');
        };
        this.tool = function (n) {
            _this.gcode.push('M6 T' + n);
        };
        this.feed = function (r) {
            _this.gcode.push('F' + r);
        };
        this.speed = function (s) {
            _this.gcode.push('G97\n M3 S' + s);
        };
        this.dwell = function (p) {
            _this.gcode.push('G4 P' + p);
        };
        this.cut = function (o) { return _this._move('G1', o, false); };
        this.icut = function (o) { return _this._move('G1', o, true); };
        this.rapid = function (o) { return _this._move('G0', o, false); };
        this.irapid = function (o) { return _this._move('G0', o, true); };
    }
    TPL.prototype._move = function (g, o, incremental) {
        if (!o || !o.hasOwnProperty)
            return;
        var oldCoords = this.coords[this.coords.length - 1];
        var newCoords = incremental ? R.clone(oldCoords) : { X: 0, Y: 0, Z: 0 };
        ['X', 'x', 'Y', 'y', 'Z', 'z'].forEach(function (p) {
            if (o.hasOwnProperty(p)) {
                var P = p.toUpperCase();
                var V = Number(o[p]);
                newCoords[P] += V;
            }
        });
        this.coords.push(newCoords);
        var code = '';
        ['X', 'Y', 'Z'].forEach(function (P) {
            if (newCoords[P] !== oldCoords[P]) {
                code += ' ' + P + newCoords[P];
            }
        });
        if (code.length) {
            this.gcode.push(g + code);
        }
    };
    TPL.prototype.output = function () {
        this.gcode.push('M02'); //end program
        return this.gcode.join('\n');
    };
    return TPL;
}());
exports.default = TPL;
