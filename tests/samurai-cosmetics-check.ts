import {cosmeticEffectProfile} from '../src/cosmetic-effect-profiles';
import {imageSourceUrl} from '../src/texture-cache';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {COSMETICS,buyCosmetic,equipCosmetic} from '../src/cosmetics';
import {WEAPONS,type WeaponId} from '../src/config';
import {samuraiWeaponCanvas,type SamuraiWeapon,SAMURAI_WEAPONS_ATLAS} from '../src/samurai-weapons';
const results=document.querySelector('#results')!,lines:string[]=[],hashes=new Set<string>();
for(const c of COSMETICS.filter(c=>c.kind==='weapon'&&WEAPONS[c.target as WeaponId].hero==='samurai')){
 const save=freshSave();save.petals=1000000;save.heroes.push('samurai');save.weapons=Object.keys(WEAPONS) as WeaponId[];
 buyCosmetic(save,c.id);if(!equipCosmetic(save,c.id))throw Error(`Cannot equip ${c.name}`);
 await new Promise<void>((resolve,reject)=>{
  const audio=new AudioManager();audio.sound=false;audio.music=false;
  const scene=new ArenaScene(save,audio,()=>{},()=>{},()=>{});let game:Phaser.Game;
  scene.onLoadingError=()=>reject(Error(`Loading failed: ${c.name}`));
  scene.onArenaReady=()=>{scene.paused=true;try{
   const atlas=scene.textures.get(SAMURAI_WEAPONS_ATLAS.key).getSourceImage() as HTMLImageElement;
   if(imageSourceUrl(atlas)!==c.asset)throw Error('Incorrect cosmetic atlas: '+imageSourceUrl(atlas));
   const expected=samuraiWeaponCanvas(atlas,c.target as SamuraiWeapon),actual=scene.textures.get(`samurai-${c.target}`).getSourceImage() as HTMLCanvasElement;
   if(actual.toDataURL()!==expected.toDataURL())throw Error('Combat texture does not match cosmetic');
   const pixels=actual.getContext('2d')!.getImageData(0,0,128,128).data;if(!pixels.some((v,i)=>i%4===3&&v>0))throw Error('Invisible weapon');
   scene.basicAttack();if(scene.hero!=='gunner'&&scene.pendingStrikes[0])scene.resolveStrike(scene.pendingStrikes[0]);
   if(!cosmeticEffectProfile(save,scene.weapon)||scene.cosmeticFx.activeCount===0)throw Error('Cosmetic attack effects did not trigger');
   hashes.add(actual.toDataURL());const card=document.createElement('article');card.textContent=c.name;card.append(expected);document.querySelector('#previews')!.append(card);
   lines.push(`PASS · ${c.name}: equip, save selection, atlas, visible combat texture & attack effects`);results.textContent=lines.join('\n');
  }catch(e){lines.push(`FAIL · ${c.name}: ${e}`);results.textContent=lines.join('\n');}setTimeout(()=>{game.destroy(true);resolve();},0);};
  game=new Phaser.Game({type:Phaser.CANVAS,parent:'arena',width:1200,height:760,scene:[scene],audio:{noAudio:true},banner:false});
 });
}
results.textContent=lines.join('\n')+`\n${hashes.size===9&&!lines.some(l=>l.startsWith('FAIL'))?'ALL 9 PASS':'CHECKS FAILED'} · ${hashes.size} distinct weapon textures`;
