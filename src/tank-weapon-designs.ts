/** Visual metadata only. Combat metrics remain in tank-weapons / weapon-effects. */
export type TankTheme='royal'|'forge'|'polar';
export type TankDesignWeapon='hammer'|'shield'|'spiked';
export const TANK_DESIGN_WEAPONS=['hammer','shield','spiked'] as const;
export const TANK_WEAPON_THEMES=['royal','forge','polar'] as const;
export const tankWeaponTheme=(finish:string):TankTheme=>finish==='sakura'?'royal':finish==='jade'?'forge':'polar';
export const tankWeaponSetAsset=(theme:TankTheme)=>`/assets/cosmetics/tank-weapons-v2/${theme}-atlas.png`;
export const isTankWeaponSet=(url:string)=>url.includes('/tank-weapons-v2/')&&url.includes('-atlas.png');
export const tankWeaponSource=(theme:TankTheme,id:TankDesignWeapon)=>`/assets/cosmetics/tank-weapons-v2/${theme}-${id}.png`;
const bounds={
 royal:{hammer:[32,285,1195,696],shield:[115,113,1018,1016],spiked:[155,31,945,1170]},
 forge:{hammer:[76,166,1394,690],shield:[98,99,1059,1040],spiked:[99,71,1053,1112]},
 polar:{hammer:[49,160,1425,706],shield:[38,48,1178,1153],spiked:[205,22,845,1193]}
} as const;
/** Hand anchors measured in the isolated artwork, after transparent padding is removed. */
export function tankWeaponDesign(theme:TankTheme,id:TankDesignWeapon){
 const crop=bounds[theme][id],ratio=crop[2]/crop[3],scale=id==='hammer'?Math.min(88/crop[2],54/crop[3]):Math.min((id==='shield'?54:56)/crop[2],(id==='shield'?54:64)/crop[3]);
 const w=crop[2]*scale,h=w/ratio,gx=id==='hammer'?(theme==='royal'?.37:theme==='forge'?.36:.35):.5,gy=id==='hammer'&&theme==='polar'?.51:.5;
 return {crop,draw:{x:64-gx*w,y:64-gy*h,w,h},grip:{x:gx,y:gy},cell:TANK_DESIGN_WEAPONS.indexOf(id)};
}
export function tankWeaponSetCanvas(image:HTMLImageElement,id:TankDesignWeapon,resolution=128){
 const c=document.createElement('canvas');c.width=c.height=resolution;const cell=TANK_DESIGN_WEAPONS.indexOf(id),size=image.height;
 c.getContext('2d')!.drawImage(image,cell*size,0,size,size,0,0,resolution,resolution);return c;
}
export function tankWeaponSetPortrait(url:string,id:TankDesignWeapon){
 const theme:TankTheme=url.includes('royal')?'royal':url.includes('forge')?'forge':'polar',a=tankWeaponDesign(theme,id),{x,y,w,h}=a.draw;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${theme} ${id} Shield Tank weapon design"><svg x="10" y="10" width="108" height="108" viewBox="${a.cell*512+x*4} ${y*4} ${w*4} ${h*4}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href="${url}" width="1536" height="512"/></svg></svg>`;
}
