import type Phaser from 'phaser';

// Pointed steel shields, with a raised rim, folded face and individual rivets.
export function drawIronHeartShields(back:Phaser.GameObjects.Graphics,front:Phaser.GameObjects.Graphics,x:number,y:number,remaining:number){
    back.clear();front.clear();
    if(remaining<=0)return;
    const phase=(2-remaining)*Math.PI;
    const shields=Array.from({length:3},(_,i)=>{
        const angle=phase+i*Math.PI*2/3;
        return {x:x+Math.cos(angle)*46,y:y-8+Math.sin(angle)*30,depth:Math.sin(angle)};
    }).sort((a,b)=>a.depth-b.depth);
    for(const shield of shields){
        const g=shield.depth<0?back:front;
        const scale=(.88+(shield.depth+1)*.09)*.72;
        const point=(dx:number,dy:number)=>({x:shield.x+dx*scale,y:shield.y+dy*scale});
        const outer=[point(0,-21),point(9,-16),point(17,-14),point(15,1),point(11,12),point(0,23),point(-11,12),point(-15,1),point(-17,-14)];
        g.fillStyle(0x17212d,1);g.fillPoints(outer,true);g.lineStyle(2,0x17212d,1);g.strokePoints(outer,true);
        g.fillStyle(0xd4e5f0,1);g.fillPoints(outer,true);g.lineStyle(1.5,0xffffff,1);g.strokePoints(outer,true);
        const face=[point(0,-15),point(11,-10),point(10,1),point(7,10),point(0,17),point(-7,10),point(-10,1),point(-11,-10)];
        g.fillStyle(0x879fb8,1);g.fillPoints(face,true);g.lineStyle(1.5,0x344352,1);g.strokePoints(face,true);
        g.fillStyle(0xecf8ff,1);g.fillPoints([point(0,-15),point(11,-10),point(10,1),point(7,10),point(0,17)],true);
        // Narrow reflective bands keep the silver face bright at gameplay size.
        g.fillStyle(0xffffff,.85);g.fillPoints([point(-8,-8),point(-3,-10),point(5,9),point(1,14)],true);
        const glint=point(9,-12),shine=2.5*scale;
        g.lineStyle(1.2,0xffffff,1);g.lineBetween(glint.x-shine,glint.y,glint.x+shine,glint.y);g.lineBetween(glint.x,glint.y-shine,glint.x,glint.y+shine);
        const top=point(0,-15),bottom=point(0,17);g.lineStyle(1,0xeaf4fb,.9);g.lineBetween(top.x,top.y,bottom.x,bottom.y);
        for(const [dx,dy] of [[0,-18],[-14,-11],[14,-11],[-11,6],[11,6],[0,20]]){
            const p=point(dx,dy);g.fillStyle(0x354353,1);g.fillCircle(p.x,p.y,2*scale);g.fillStyle(0xf0f5f7,1);g.fillCircle(p.x-.4,p.y-.5,1.1*scale);
        }
    }
}
