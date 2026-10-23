import {TANK_WEAPON_THEMES,TANK_DESIGN_WEAPONS,tankWeaponDesign,tankWeaponSource} from '../src/tank-weapon-designs';
for(const theme of TANK_WEAPON_THEMES){
 const section=document.createElement('section'),atlas=document.createElement('canvas');atlas.width=1536;atlas.height=512;section.innerHTML=`<h2>${theme}</h2>`;section.append(atlas);document.querySelector('main')!.append(section);const g=atlas.getContext('2d')!;
 for(const id of TANK_DESIGN_WEAPONS){const im=new Image();im.src=tankWeaponSource(theme,id);await im.decode();const {crop:[x,y,w,h],draw,cell}=tankWeaponDesign(theme,id),sprite=document.createElement('canvas');sprite.width=w;sprite.height=h;const s=sprite.getContext('2d')!;s.drawImage(im,x,y,w,h,0,0,w,h);
 // Remove only low-alpha generation halos; preserve the opaque illustration and clean outline.
 const data=s.getImageData(0,0,w,h);for(let i=3;i<data.data.length;i+=4)if(data.data[i]<160)data.data[i]=0;s.putImageData(data,0,0);
 g.drawImage(sprite,cell*512+draw.x*4,draw.y*4,draw.w*4,draw.h*4);
 }
 const data=document.createElement('textarea');data.id=`${theme}-atlas`;data.textContent=atlas.toDataURL();section.append(data);
}
document.body.dataset.ready='true';
