import Phaser from 'phaser';
import {CosmeticWeaponEffects} from '../src/cosmetic-weapon-fx';
import {cosmeticEffectProfile,COSMETIC_FX_LIMIT} from '../src/cosmetic-effect-profiles';
import {freshSave} from '../src/save';
import {COSMETICS} from '../src/cosmetics';
import type {WeaponId} from '../src/config';
class Preview extends Phaser.Scene{
 private entries:{fx:CosmeticWeaponEffects;p:NonNullable<ReturnType<typeof cosmeticEffectProfile>>;x:number;y:number;gun:boolean}[]=[];private next=0;
 create(){const stress=new CosmeticWeaponEffects(this),stressSave=freshSave();stressSave.cosmetics.owned=['weapon:hammer:jade'];stressSave.cosmetics.equipped['weapon:hammer']='weapon:hammer:jade';const stressProfile=cosmeticEffectProfile(stressSave,'hammer')!;for(let i=0;i<2000;i++){stress.strike(stressProfile,-10000,-10000,0,80,2,i*.05,true);stress.impact(stressProfile,-10000,-10000,i*.05,true);}if(stress.activeCount>COSMETIC_FX_LIMIT)throw Error('Stress test exceeded effect cap');stress.render(1000,[],undefined);if(stress.activeCount!==0)throw Error('Expired effects not released');const g=this.add.graphics();const targets=['nodachi','katana','pistols','hammer'] as WeaponId[];let i=0;
  for(const weapon of targets)for(const suffix of ['sakura','jade','starlight']){const c=COSMETICS.find(c=>c.id===`weapon:${weapon}:${suffix}`)!,save=freshSave();save.cosmetics.owned.push(c.id);save.cosmetics.equipped[`weapon:${weapon}`]=c.id;const p=cosmeticEffectProfile(save,weapon)!;const col=i%3,row=Math.floor(i/3),x=col*280+140,y=row*190+90;g.fillStyle(0x20322f);g.fillRoundedRect(col*280+8,row*190+8,264,174,12);this.add.text(col*280+22,row*190+20,p.name,{fontSize:'16px',color:'#eee8d8'});this.add.text(col*280+22,row*190+42,c.name,{fontSize:'11px',color:'#aabeb6'});this.entries.push({fx:new CosmeticWeaponEffects(this),p,x,y,gun:weapon==='pistols'});i++;}
  document.querySelector('#replay')!.addEventListener('click',()=>this.next=0);
 }
 update(ms:number){const time=ms/1000;if(time>=this.next){for(const e of this.entries){if(e.gun)e.fx.muzzle(e.p,e.x-45,e.y,0,time);else e.fx.strike(e.p,e.x-40,e.y,0,64,2,time,e.p.motif==='rune'||e.p.motif==='snow'||e.p.motif==='crown');e.fx.impact(e.p,e.x+55,e.y,time,true);}this.next=time+1.25;}
  for(const e of this.entries)e.fx.render(time,e.gun?[{active:true,hostile:false,x:e.x+Math.sin(time*5)*40,y:e.y+25,vx:650,vy:0}]:[],e.p);
  if(this.entries.some(e=>e.fx.activeCount>COSMETIC_FX_LIMIT))throw Error('Particle cap exceeded');document.querySelector('#result')!.textContent='12 distinct motifs · bounded decorative effects · no damage, range or timing changes';
 }
}
new Phaser.Game({type:Phaser.CANVAS,parent:'preview',width:840,height:760,backgroundColor:'#14232a',scene:[Preview],audio:{noAudio:true},banner:false});
