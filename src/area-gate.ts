import type Phaser from 'phaser';
export class AreaGate {
    age=0;
    constructor(public x:number,public y:number){}
    entered(x:number,y:number){return Math.hypot(x-this.x,y-this.y)<=34;}
    draw(g:Phaser.GameObjects.Graphics){
        const {x,y,age}=this,cy=y-40;
        const point=(a:number,r:number)=>({x:x+Math.cos(a)*r,y:cy+Math.sin(a)*r*1.65});
        // A dark opening surrounded by irregular, flowing bands rather than a solid frame.
        g.fillStyle(0x082348,.16);g.fillEllipse(x,cy,108,174);
        g.fillStyle(0x030f37,1);g.fillEllipse(x,cy,65,116);
        const band=(radius:number,width:number,color:number,speed:number)=>{
            const outside: {x:number;y:number}[]=[],inside: {x:number;y:number}[]=[];
            for(let i=0;i<=112;i++){
                const a=i/112*Math.PI*2;
                const wave=Math.sin(a*7-age*speed)*1.5+Math.sin(a*11+age*.8)*.8;
                outside.push(point(a,radius+width/2+wave));
                inside.push(point(a,radius-width/2+wave*.65));
            }
            g.fillStyle(color,1);g.fillPoints([...outside,...inside.reverse()],true);
        };
        band(43,10,0x2469a8,1.7);
        band(38,11,0x49afd4,2.1);
        band(34,7,0x9eeeff,2.5);
        band(29,6,0x187eb3,1.9);
        // Tapered curved tongues travel around the opening like liquid blue fire.
        for(let i=0;i<9;i++){
            const start=i*Math.PI*2/9-age*.7;
            const outer: {x:number;y:number}[]=[],inner: {x:number;y:number}[]=[];
            for(let j=0;j<=16;j++){
                const t=j/16,a=start+t*.8,r=33+Math.sin(t*Math.PI)*5;
                const width=Math.sin(t*Math.PI)*3.3;
                outer.push(point(a,r+width));inner.push(point(a,r-width));
            }
            g.fillStyle(i%3===0?0xd0faff:i%3===1?0x75d9f4:0x248bbb,1);
            g.fillPoints([...outer,...inner.reverse()],true);
        }
        // Detached outer wisps break up the silhouette without a geometric outline.
        for(let i=0;i<11;i++){
            const start=i*Math.PI*2/11-age*.45;
            const points: {x:number;y:number}[]=[];
            for(let j=0;j<=8;j++){const t=j/8;points.push(point(start+t*.23,48+Math.sin(t*Math.PI)*4));}
            for(let j=8;j>=0;j--){const t=j/8;points.push(point(start+t*.23,48-Math.sin(t*Math.PI)*1.5));}
            g.fillStyle(i%3===0?0x4faed7:0x2669aa,.95);g.fillPoints(points,true);
        }
        g.fillStyle(0x56c9f4,.1);g.fillEllipse(x,y+33,94,14);
    }
}
