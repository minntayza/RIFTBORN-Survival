export const NINJA_ATTACK_ATLAS={key:'ninja-attack-parts-v1',url:'/assets/characters/ninja-attack-parts-v1.webp'};
const regions={upper:[155,283,252,345],forearm:[715,282,202,357],hand:[1210,346,305,325],sword:[1809,32,172,660]} as const;
export function ninjaAttackPart(image:HTMLImageElement,part:keyof typeof regions){
 const [x,y,w,h]=regions[part],c=document.createElement('canvas');c.width=w;c.height=h;
 c.getContext('2d')!.drawImage(image,x,y,w,h,0,0,w,h);return c;
}
export function ninjaSwordCanvas(image:HTMLImageElement,resolution=512){
 const c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!;g.scale(resolution/128,resolution/128);g.imageSmoothingQuality='high';
 g.translate(44,64);g.rotate(Math.PI/2);g.scale(.65,1);
 const [x,y,w,h]=regions.sword;g.drawImage(image,x,y,w,h,-11,-76,23,90);return c;
}
export const NINJA_WEAPONS_ATLAS={key:'ninja-weapons-v1',url:'/assets/characters/ninja-weapons-v1.webp'};
export function ninjaWeaponCanvas(image:HTMLImageElement,id:'dual'|'kama',resolution=512){
 const c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!;g.scale(resolution/128,resolution/128);g.imageSmoothingQuality='high';
 g.translate(id==='kama'?45:44,64);g.rotate(Math.PI/2);g.scale(.65,1);
 if(id==='dual')g.drawImage(image,585,37,204,643,-13,-71,26,92);
 else{g.scale(-1,1);g.drawImage(image,1371,113,508,549,-9,-66,52,86);}
 return c;
}
export function ninjaWeaponPortrait(id:'katana'|'dual'|'kama'){
 const region=id==='katana'?[1809,32,172,660]:id==='dual'?[585,37,204,643]:[1371,113,508,549];
 const url=id==='katana'?NINJA_ATTACK_ATLAS.url:NINJA_WEAPONS_ATLAS.url;
 const piece=(x:number,y:number,w:number,h:number)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${region.join(' ')}" overflow="hidden" preserveAspectRatio="none"><image href="${url}" width="2172" height="724"/></svg>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id==='dual'?'Dual Blades':id==='kama'?'Kama':'Katana'} illustration">${id==='dual'?piece(30,18,24,90)+piece(73,18,24,90):id==='kama'?piece(23,16,81,94):piece(49,9,28,110)}</svg>`;
}
