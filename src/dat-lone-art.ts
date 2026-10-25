import type Phaser from 'phaser';
/** Gold-and-ruby Dat Lone, matching the approved Twin Dat Lone card. */
export function drawDatLone(g:Phaser.GameObjects.Graphics,x:number,y:number,r:number,time:number,quiet:boolean){
 const ellipse=(dx:number,dy:number,w:number,h:number,color:number,alpha=1)=>{g.fillStyle(color,alpha);g.fillEllipse(x+dx*r,y+dy*r,w*r,h*r);};
 const diamond=(dx:number,dy:number,size:number)=>{const cx=x+dx*r,cy=y+dy*r,d=size*r;g.fillStyle(0x491d24,1);g.fillPoints([{x:cx,y:cy-d*1.35},{x:cx+d,y:cy},{x:cx,y:cy+d*1.35},{x:cx-d,y:cy}],true);g.fillStyle(0xffd65e,1);g.fillPoints([{x:cx,y:cy-d*1.12},{x:cx+d*.78,y:cy},{x:cx,y:cy+d*1.12},{x:cx-d*.78,y:cy}],true);g.fillStyle(0xe52f42,1);g.fillPoints([{x:cx,y:cy-d*.84},{x:cx+d*.57,y:cy},{x:cx,y:cy+d*.84},{x:cx-d*.57,y:cy}],true);g.fillStyle(0xffb4a8,1);g.fillTriangle(cx,cy-d*.84,cx-d*.57,cy,cx,cy);g.fillStyle(0x991c32,1);g.fillTriangle(cx,cy,cx+d*.57,cy,cx,cy+d*.84);g.lineStyle(Math.max(.7,r*.035),0xffe1c2,1);g.lineBetween(cx-d*.36,cy,cx+d*.36,cy);g.lineBetween(cx,cy-d*.57,cx,cy+d*.57);};
 // Short orbit ribbons stay close to the object, distinct from the true pull radius.
 const a=quiet?-.4:time*2.8;
 if(!quiet){const points=[];for(let i=0;i<=18;i++){const t=a-2.8+i/18*2.8;points.push({x:x+Math.cos(t)*r*1.7,y:y+Math.sin(t)*r*.58+r*.55});}g.lineStyle(r*.28,0xffb72f,.25);g.strokePoints(points,false);g.lineStyle(r*.12,0xffdf6d,.95);g.strokePoints(points,false);g.lineStyle(Math.max(.7,r*.04),0xfff6ca,1);g.strokePoints(points,false);}
 ellipse(0,0,2.14,2.14,0x491d24);ellipse(0,0,1.98,1.98,0xc97815);ellipse(-.08,-.13,1.78,1.7,0xffb52c);ellipse(-.18,-.29,1.45,1.25,0xffdd52);ellipse(-.3,-.42,.92,.78,0xffec7e);
 // Gold equatorial belt and dark lower edge, with a readable central ruby stone.
 ellipse(0,.18,2.05,.72,0x633318);ellipse(0,.09,2.02,.58,0xe69a22);ellipse(0,-.02,1.98,.31,0xffe487);ellipse(0,.08,1.98,.16,0xffc747);
 diamond(-.77,.1,.23);diamond(.77,.1,.23);diamond(0,.17,.52);
 // Raised gold cap and ruby dome.
 ellipse(.05,-.94,.88,.47,0x491d24);ellipse(.05,-.96,.76,.31,0xe99b22);ellipse(.05,-1.05,.67,.3,0xffe782);ellipse(.05,-1.14,.56,.38,0x5e1d2a);ellipse(.05,-1.16,.45,.28,0xe93245);ellipse(-.02,-1.2,.24,.13,0xffaaa0);
 ellipse(-.43,-.54,.38,.19,0xfff8cf);ellipse(-.22,-.71,.18,.12,0xffffff);ellipse(.68,-.34,.13,.28,0xfff1ab);ellipse(-.05,-1.23,.12,.07,0xffffff);
}
