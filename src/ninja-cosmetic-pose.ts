export function ninjaCosmeticShoulder(x:number,y:number,side:number,facing=1,modern:boolean|'ancient'|'future'=false){return {x:x+(side===0?(modern===true?14:12):(modern===true?-6:modern==='ancient'?-9:modern==='future'?-8:-12))*facing,y:y+(modern===true?5:modern==='ancient'?4:2)};}
/** Relax the ready stance; the damaging middle of the original swing stays unchanged. */
export function ninjaCosmeticPose<T extends {grip:{x:number;y:number};tip:{x:number;y:number};rotation:number}>(p:T,x:number,y:number,aim:number,phase:number,active:boolean,offhand=false,modern:boolean|'ancient'|'future'=false){
 const facing=Math.cos(aim)<0?-1:1,t=Math.max(0,Math.min(1,phase));
 const smooth=(v:number)=>v*v*(3-2*v);
 const rest=active?t<.22?1-smooth(t/.22):t>.72?smooth((t-.72)/.28):0:1;
 if(rest===0&&modern!=='ancient'&&modern!=='future')return p;
 const rotation=p.rotation+.45*facing*rest,shoulder=ninjaCosmeticShoulder(x,y,offhand?1:0,facing,modern);
 const ready={x:shoulder.x+Math.cos(aim+.8*facing)*18,y:shoulder.y+Math.sin(aim+.8*facing)*18};
 let grip={x:p.grip.x+(ready.x-p.grip.x)*rest,y:p.grip.y+(ready.y-p.grip.y)*rest};
 if(modern==='ancient'||modern==='future'){const dx=grip.x-shoulder.x,dy=grip.y-shoulder.y,d=Math.hypot(dx,dy)||1;grip={x:shoulder.x+dx/d*21,y:shoulder.y+dy/d*21};}
 const delta=rotation-p.rotation,dx=p.tip.x-p.grip.x,dy=p.tip.y-p.grip.y;
 return {...p,grip,rotation,tip:{x:grip.x+Math.cos(delta)*dx-Math.sin(delta)*dy,y:grip.y+Math.sin(delta)*dx+Math.cos(delta)*dy}};
}

export function ninjaOutfitFit(url:string):boolean|'ancient'|'future'{return url.includes('ninja-ancient')?'ancient':url.includes('ninja-future')?'future':url.includes('ninja-modern-rig-v');}
