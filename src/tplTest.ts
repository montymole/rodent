import TPL from './tpl';

const program = new TPL();
const { METRIC, icut, cut, rapid, units, tool, feed, speed, dwell } = program;

units(METRIC); // units 
tool(1); //select tool
feed(123);  //set feed rate to mm/second
speed(20000); //spin RPM 
dwell(50);     // Wait for spindle to spin up
rapid({z:0,y:0,x:0})
cut({z:-5,y:0,x:0})
cut({z:-5,y:100,x:200})
icut({x:-100});
icut({y:-10});
icut({x:-10})
icut({y:-90});

program.output();
