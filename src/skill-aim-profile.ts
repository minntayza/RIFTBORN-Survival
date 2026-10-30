import {ABILITY_TUNING as T} from './config';
export type AimProfile={shape:'ground'|'line'|'self'|'cone';range:number;radius:number};
/** Guides describe the existing skill geometry; aiming never changes its damage or reach. */
export function skillAimProfile(hero:string,id:string):AimProfile{
 if(hero==='gunner'&&id==='breach')return{shape:'ground',range:T.breach.throwRange,radius:T.breach.radius};
 if(hero==='gunner'&&id==='beacon')return{shape:'ground',range:T.beacon.deployRange,radius:T.beacon.radius};
 if(hero==='ninja')return{shape:'line',range:227.5,radius:24};
 if(hero==='samurai')return id==='draw'?{shape:'line',range:T.draw.distance,radius:T.draw.radius}:{shape:'self',range:id==='mark'?T.mark.range:150,radius:150};
 if(hero==='tank')return id==='bulwark'?{shape:'cone',range:T.bulwark.radius,radius:T.bulwark.radius}:id==='march'?{shape:'line',range:160,radius:T.march.pushRadius}:{shape:'self',range:150,radius:150};
 if(hero==='pyusawhti')return id==='windfocus'?{shape:'self',range:90,radius:90}:{shape:id==='multishot'?'cone':'line',range:id==='banepierce'?920:650,radius:24};
 if(hero==='lethwei')return id==='blitz'?{shape:'line',range:145,radius:38}:{shape:'self',range:id==='lethweiring'?175:110,radius:id==='lethweiring'?175:110};
 if(hero==='zawgyi')return id==='datlone'?{shape:'line',range:190,radius:160}:id==='flame'?{shape:'line',range:204.8,radius:28}:{shape:'self',range:175,radius:175};
 return{shape:'self',range:100,radius:100};
}
