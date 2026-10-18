export const TANK_WEAPONS_ATLAS={key:'tank-weapons-v1',url:'/assets/characters/tank-weapons-v1.webp'};
export const TANK_WEAPONS=['shield','spiked','hammer'] as const;
export type TankWeapon=typeof TANK_WEAPONS[number];
export const isTankWeapon=(id:string):id is TankWeapon=>(TANK_WEAPONS as readonly string[]).includes(id);
export const TANK_WEAPON_ART={
 shield:{rect:[56,56,439,604],draw:{x:42,y:45,w:44,h:66},tip:{x:22,y:14}},
 spiked:{rect:[564,18,613,648],draw:{x:42,y:45,w:56,h:66},tip:{x:34,y:14}},
 hammer:{rect:[1192,217,936,438],draw:{x:38,y:43,w:88,h:41},tip:{x:48,y:0}}
} as const;
export function tankWeaponMetrics(id:TankWeapon){return {grip:{x:0,y:0},tip:TANK_WEAPON_ART[id].tip};}
export function tankWeaponCanvas(image:HTMLImageElement,id:TankWeapon){const a=TANK_WEAPON_ART[id],c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.drawImage(image,a.rect[0],a.rect[1],a.rect[2],a.rect[3],a.draw.x,a.draw.y,a.draw.w,a.draw.h);return c;}
export function tankWeaponPortrait(id:TankWeapon){const a=TANK_WEAPON_ART[id],w=id==='hammer'?116:116*a.draw.w/a.draw.h,h=id==='hammer'?116*a.draw.h/a.draw.w:116;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id==='hammer'?'War Hammer':id==='spiked'?'Spiked Shield':'Shield'} Tank weapon illustration"><svg x="${64-w/2}" y="${64-h/2}" width="${w}" height="${h}" viewBox="${a.rect.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${TANK_WEAPONS_ATLAS.url}" width="2172" height="724"/></svg></svg>`;}
