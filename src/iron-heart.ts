export class IronHeart {
    remaining=0;
    cooldown=0;
    activate(){this.remaining=2;this.cooldown=12;}
    tick(dt:number){this.remaining=Math.max(0,this.remaining-dt);this.cooldown=Math.max(0,this.cooldown-dt);if(this.remaining<1e-8)this.remaining=0;if(this.cooldown<1e-8)this.cooldown=0;}
    absorb(damage:number){
        if(damage<=0)return damage;
        if(this.cooldown<=0)this.activate();
        return this.remaining>0?damage*.25:damage;
    }
}
