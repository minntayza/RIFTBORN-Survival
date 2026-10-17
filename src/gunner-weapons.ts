export const GUNNER_WEAPONS_ATLAS={key:'gunner-weapons-v1',url:'/assets/characters/gunner-weapons-v1.png'};
export const GUNNER_WEAPONS=['pistols','shotgun','smg'] as const;
export type GunnerWeapon=typeof GUNNER_WEAPONS[number];
export const isGunnerWeapon=(id:string):id is GunnerWeapon=>(GUNNER_WEAPONS as readonly string[]).includes(id);
export const GUN_ART={
 pistols:{rect:[276,86,605,455],grip:{x:388,y:405},fore:{x:388,y:405},muzzle:{x:878,y:220},w:54,h:40,size:70},
 shotgun:{rect:[39,601,966,364],grip:{x:365,y:870},fore:{x:750,y:795},muzzle:{x:1000,y:724},w:86,h:32,size:98},
 smg:{rect:[230,1017,672,440],grip:{x:355,y:1330},fore:{x:677,y:1325},muzzle:{x:898,y:1165},w:72,h:47,size:90}
} as const;
export function gunnerWeaponLocal(id:GunnerWeapon){const a=GUN_ART[id],point=(p:{x:number;y:number})=>({x:(p.x-a.grip.x)*a.w/a.rect[2],y:(p.y-a.grip.y)*a.h/a.rect[3]});return {fore:point(a.fore),tip:point(a.muzzle),size:a.size};}
export function gunnerWeaponCanvas(image:HTMLImageElement,id:GunnerWeapon){const a=GUN_ART[id],[x,y,w,h]=a.rect,c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.drawImage(image,x,y,w,h,64-(a.grip.x-x)*a.w/w,64-(a.grip.y-y)*a.h/h,a.w,a.h);return c;}
export function gunnerWeaponPortrait(id:GunnerWeapon){const a=GUN_ART[id],[x,y,w,h]=a.rect;const piece=(dx:number,dy:number,dw:number,dh:number)=>`<svg x="${dx}" y="${dy}" width="${dw}" height="${dh}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="hidden"><image href="${GUNNER_WEAPONS_ATLAS.url}" width="1024" height="1536"/></svg>`;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id==='pistols'?'Twin Pistols':id==='shotgun'?'Shotgun':'SMG'} Gunner weapon illustration">${id==='pistols'?piece(7,12,72,54)+piece(49,63,72,54):piece(6,64-116*h/w/2,116,116*h/w)}</svg>`;}
