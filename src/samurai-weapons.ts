export const SAMURAI_WEAPONS_ATLAS={key:'samurai-weapons-v1',url:'/assets/characters/samurai-weapons-v1.webp'};
export const SAMURAI_WEAPONS=['nodachi','cursed','naginata'] as const;
export type SamuraiWeapon=typeof SAMURAI_WEAPONS[number];
export const isSamuraiWeapon=(id:string):id is SamuraiWeapon=>(SAMURAI_WEAPONS as readonly string[]).includes(id);
export const SAMURAI_WEAPON_ART={
 nodachi:{rect:[357,14,143,987],sourceGrip:{x:421,y:785},sourceTip:{x:366,y:20},width:24,height:94,origin:{x:47,y:64}},
 cursed:{rect:[721,86,147,915],sourceGrip:{x:782,y:785},sourceTip:{x:758,y:93},width:25,height:94,origin:{x:47,y:64}},
 naginata:{rect:[1068,12,135,988],sourceGrip:{x:1154,y:765},sourceTip:{x:1075,y:20},width:26,height:114,origin:{x:34,y:64}}
} as const;
/** Local contact coordinates come from the same source anchors used to draw the sprite. */
export function samuraiWeaponMetrics(id:SamuraiWeapon){
 const a=SAMURAI_WEAPON_ART[id],dx=(a.sourceTip.x-a.sourceGrip.x)*a.width/a.rect[2],dy=(a.sourceTip.y-a.sourceGrip.y)*a.height/a.rect[3];
 return {grip:{x:a.origin.x-64,y:a.origin.y-64},tip:{x:a.origin.x-dy-64,y:a.origin.y+dx-64}};
}
export function samuraiWeaponCanvas(image:HTMLImageElement,id:SamuraiWeapon){
 const a=SAMURAI_WEAPON_ART[id],[x,y,w,h]=a.rect,c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 g.translate(a.origin.x,a.origin.y);g.rotate(Math.PI/2);
 g.drawImage(image,x,y,w,h,-(a.sourceGrip.x-x)*a.width/w,-(a.sourceGrip.y-y)*a.height/h,a.width,a.height);return c;
}
export function samuraiWeaponPortrait(id:SamuraiWeapon){
 const a=SAMURAI_WEAPON_ART[id],[x,y,w,h]=a.rect,drawHeight=116,drawWidth=drawHeight*a.width/a.height;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id==='nodachi'?'Nodachi':id==='cursed'?'Cursed Blade':'Naginata'} Samurai weapon illustration"><svg x="${64-drawWidth/2}" y="6" width="${drawWidth}" height="${drawHeight}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="hidden"><image href="${SAMURAI_WEAPONS_ATLAS.url}" width="1536" height="1024"/></svg></svg>`;
}
