import {imageSourceUrl} from '../src/texture-cache';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {COSMETICS,buyCosmetic,equipCosmetic} from '../src/cosmetics';
import {WEAPONS,type WeaponId} from '../src/config';
import {gunnerWeaponCanvas,type GunnerWeapon,GUNNER_WEAPONS_ATLAS} from '../src/gunner-weapons';
import {gunnerCanvas,GUNNER_ATLAS} from '../src/gunner-art';
const results=document.querySelector('#results')!,lines:string[]=[],hashes=new Set<string>();
for(const c of COSMETICS.filter(c=>c.kind==='weapon'&&WEAPONS[c.target as WeaponId].hero==='gunner')){
 const save=freshSave();save.heroes.push('gunner');save.weapons=Object.keys(WEAPONS) as WeaponId[];
 const outfit=COSMETICS.find(o=>o.kind==='character'&&o.target==='gunner'&&o.id.endsWith(c.id.split(':').at(-1)!))!;buyCosmetic(save,outfit.id);equipCosmetic(save,outfit.id);
 buyCosmetic(save,c.id);if(!equipCosmetic(save,c.id))throw Error(`Cannot equip ${c.name}`);
 await new Promise<void>((resolve,reject)=>{
  const audio=new AudioManager();audio.sound=false;audio.music=false;
  const scene=new ArenaScene(save,audio,()=>{},()=>{},()=>{});let game:Phaser.Game;
  scene.onLoadingError=()=>reject(Error(`Loading failed: ${c.name}`));
  scene.onArenaReady=()=>{scene.paused=true;try{
   const atlas=scene.textures.get(GUNNER_WEAPONS_ATLAS.key).getSourceImage() as HTMLImageElement;
   if(imageSourceUrl(atlas)!==c.asset)throw Error('Incorrect cosmetic atlas: '+imageSourceUrl(atlas));
   const expected=gunnerWeaponCanvas(atlas,c.target as GunnerWeapon),actual=scene.textures.get(`gunner-${c.target}`).getSourceImage() as HTMLCanvasElement;
   if(actual.toDataURL()!==expected.toDataURL())throw Error('Combat texture does not match cosmetic');
   const bodyAtlas=scene.textures.get(GUNNER_ATLAS.key).getSourceImage() as HTMLImageElement;
   if(imageSourceUrl(bodyAtlas)!==outfit.asset)throw Error('Incorrect outfit atlas');
   scene.visuals.prepareTexture('cute-gunner-0');
   const body=scene.textures.get('cute-gunner-0').getSourceImage() as HTMLCanvasElement;
   if(body.toDataURL()!==gunnerCanvas(bodyAtlas,0).toDataURL())throw Error('Outfit cache does not match selected design');
   const pixels=actual.getContext('2d')!.getImageData(0,0,128,128).data;if(!pixels.some((v,i)=>i%4===3&&v>0))throw Error('Invisible weapon');
   hashes.add(actual.toDataURL());const card=document.createElement('article');card.textContent=c.name;card.append(expected);document.querySelector('#previews')!.append(card);
   lines.push(`PASS · ${c.name}: outfit, weapon, selection, atlas, visible combat texture`);results.textContent=lines.join('\n');
  }catch(e){lines.push(`FAIL · ${c.name}: ${e}`);results.textContent=lines.join('\n');}setTimeout(()=>{game.destroy(true);resolve();},0);};
  game=new Phaser.Game({type:Phaser.CANVAS,parent:'arena',width:1200,height:760,scene:[scene],audio:{noAudio:true},banner:false});
 });
}
results.textContent=lines.join('\n')+`\n${hashes.size===9&&!lines.some(l=>l.startsWith('FAIL'))?'ALL 9 PASS':'CHECKS FAILED'} · ${hashes.size} distinct weapon textures`;
