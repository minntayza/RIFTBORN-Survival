export type ChainBlast={x:number;y:number;damage:number;radius:number;delay:number};
export class Cataclysm {
    pending:ChainBlast[]=[];
    trigger(targets:readonly {x:number;y:number}[],damage:number){
        // Snapshot positions before primary damage kills or knocks enemies away.
        const room=Math.max(0,12-this.pending.length);
        for(const [i,target] of targets.slice(0,Math.min(6,room)).entries())
            this.pending.push({x:target.x,y:target.y,damage:damage*.3,radius:60,delay:.12+i*.055});
    }
    tick(dt:number){
        const ready:ChainBlast[]=[];
        this.pending=this.pending.filter(blast=>{blast.delay-=dt;if(blast.delay<=0){ready.push(blast);return false;}return true;});
        return ready;
    }
    clear(){this.pending=[];}
}
