/** Keep 30% of combat gold; carry tenths so small coin drops are not rounded away. */
export class GoldPayout{
 private remainder=0;
 grant(base:number){const tenths=this.remainder+Math.max(0,Math.floor(base))*3,paid=Math.floor(tenths/10);this.remainder=tenths%10;return paid;}
}
