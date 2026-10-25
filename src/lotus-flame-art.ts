import type Phaser from 'phaser';
/** Pointed pink lotus petals with nested golden flames, matching the card silhouette. */
export function drawFlameLotus(g:Phaser.GameObjects.Graphics,x:number,y:number,size:number,alpha:number,age:number,quiet:boolean,azure=false){
 const scale=quiet?1:Math.min(1,Math.max(.2,age/.16)),r=size*scale;
 const petal=(tx:number,ty:number,width:number,color:number)=>{const tip={x:x+tx*r,y:y+ty*r},base={x,y:y+r*.13},dx=tip.x-base.x,dy=tip.y-base.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*width*r,ny=dx/len*width*r;
 const points=[];for(let side=1;side>=-1;side-=2)for(let j=0;j<=9;j++){const t=side===1?j/9:1-j/9,u=1-t;points.push({x:u*u*base.x+2*u*t*(base.x+dx*.22+nx*side)+t*t*tip.x,y:u*u*base.y+2*u*t*(base.y+dy*.22+ny*side)+t*t*tip.y});}
 const blue:Record<number,number>={0xde3d63:0x2857c7,0xf16886:0x3e91ef,0xff9b64:0x37c3f3,0xffab35:0x2999f1,0xffb532:0x53d7ff,0xffe475:0xa3eeff,0xfff5be:0xf1fff4,0xf96c80:0x409fe9,0xffb460:0x77dffc};
 g.fillStyle(azure?(blue[color]??color):color,alpha);g.fillPoints(points,true);g.lineStyle(Math.max(.8,r*.065),azure?0x183f78:0x813044,alpha);g.strokePoints(points,true);
 };
 g.fillStyle(azure?0x44caff:0xffae4f,alpha*.14);g.fillEllipse(x,y+r*.08,r*2.2,r*.8);
 petal(-.9,-.3,.34,0xde3d63);petal(.9,-.3,.34,0xde3d63);
 petal(-.7,-.85,.35,0xf16886);petal(.7,-.85,.35,0xf16886);
 petal(-.38,-1.1,.34,0xff9b64);petal(.38,-1.1,.34,0xff9b64);
 petal(0,-1.45,.42,0xffab35);
 // Golden fire tongues nest inside the flower instead of surrounding it with unrelated spikes.
 petal(-.42,-.7,.2,0xffb532);petal(.42,-.7,.2,0xffb532);petal(0,-1.16,.29,0xffe475);
 petal(0,-.79,.18,0xfff5be);
 petal(-.62,-.12,.26,0xf96c80);petal(.62,-.12,.26,0xf96c80);petal(0,-.32,.22,0xffb460);
 g.fillStyle(azure?0xe2fffa:0xffedb0,alpha);g.fillEllipse(x,y-r*.13,r*.18,r*.12);
 if(!quiet){const rise=(age*1.1)%1;g.fillStyle(azure?0xb8f5ff:0xffdf86,alpha*(1-rise));g.fillCircle(x+Math.sin(age*5)*r*.32,y-r*(1.25+rise*.5),Math.max(.7,r*.06)*(1-rise));}
}
