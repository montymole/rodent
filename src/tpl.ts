import * as R from 'ramda';

export default class TPL {

    gcode = ['(generated with TPL class 1.0)'];
    coords = [{ X: 0, Y: 0, Z: 0 }];

    METRIC = 1;

    units = (t) => {
        this.gcode.push(t === this.METRIC ? 'G21' : 'G20');
    }
    tool = (n) => {
        this.gcode.push('M6 T' + n);
    }
    feed = (r) => {
        this.gcode.push('F' + r);
    }
    speed = (s) => {
        this.gcode.push('G97\n M3 S' + s);
    }
    dwell = (p) => {
        this.gcode.push('G4 P' + p);
    }
    _move(g, o, incremental) {
        if (!o || !o.hasOwnProperty) return;
        const oldCoords = this.coords[this.coords.length - 1];
        const newCoords = incremental ? R.clone(oldCoords) : { X: 0, Y: 0, Z: 0 };
        ['X', 'x', 'Y', 'y', 'Z', 'z'].forEach(p => {
            if (o.hasOwnProperty(p)) {
                const P = p.toUpperCase();
                const V = Number(o[p]);
                newCoords[P] += V;
            }
        });
        this.coords.push(newCoords);
        let code = '';
        ['X', 'Y', 'Z'].forEach(P => {
            if (newCoords[P] !== oldCoords[P]) {
                code += ' ' + P + newCoords[P];
            }
        });
        if (code.length) {
            this.gcode.push(g + code);
        }
    }
    cut = (o) => this._move('G1',o, false);
    icut = (o) => this._move('G1',o, true);
    rapid = (o) => this._move('G0',o, false);
    irapid = (o) => this._move('G0',o, true);
    
    output() {
        this.gcode.push('M02'); //end program
        return this.gcode.join('\n');
    }

}