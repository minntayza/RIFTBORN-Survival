import test from 'node:test';
import assert from 'node:assert/strict';
import {COURT_WALLS,COURT_ART_WIDTH,COURT_ART_HEIGHT} from '../src/last-camp-occlusion';
function covered(x:number,y:number){return COURT_WALLS.some(p=>{let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [a,b]=p[i],[c,d]=p[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;});}
test('wall foreground covers gate pillars and ramparts',()=>{for(const [x,y] of [[548,910],[895,910],[320,965],[1100,965],[340,80],[1100,80],[120,370],[1320,370]])assert.ok(covered(x,y),`${x},${y}`);});
test('floor and all four entrances remain visible',()=>{for(const [x,y] of [[724,543],[724,65],[724,990],[55,465],[1390,465],[350,500],[1100,500]])assert.equal(covered(x,y),false,`${x},${y}`);});
test('silhouettes remain registered to native artwork bounds',()=>{for(const p of COURT_WALLS)for(const [x,y] of p){assert.ok(x>=0&&x<=COURT_ART_WIDTH);assert.ok(y>=0&&y<=COURT_ART_HEIGHT);}});
