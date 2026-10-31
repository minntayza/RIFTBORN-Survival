/** Keep 30% normally, or 15% for half-value sources; carry twentieths across payouts. */
export class GoldPayout{
 private remainder=0;
 grant(base:number,multiplier:1|.5=1){const units=this.remainder+Math.max(0,Math.floor(base))*6*multiplier,paid=Math.floor(units/20);this.remainder=units%20;return paid;}
}
