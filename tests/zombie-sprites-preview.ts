import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {ZOMBIE_SPRITES,ZOMBIE_ATLASES} from '../src/zombie-sprites';
import {ENEMIES} from '../src/config';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:innerWidth,height:innerHeight,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
const ready=setInterval(()=>{
 if(!scene.visuals)return;
 clearInterval(ready);scene.paused=true;for(const e of scene.enemies)e.active=false;scene.x=600;scene.y=380;scene.save.settings.mapView=new URLSearchParams(location.search).has('wide')?2:1;scene.applyMapView();
 for(const type of ZOMBIE_SPRITES){scene.spawn(type);const enemy=scene.enemies.filter(e=>e.active).at(-1)!;const i=ZOMBIE_SPRITES.indexOf(type);enemy.x=600+(i%3-1)*230;enemy.y=380+(Math.floor(i/3)-1)*200;enemy.telegraph=0;enemy.flash=0;
 scene.add.text(enemy.x,enemy.y+enemy.r*1.8,ENEMIES[type].name,{fontSize:'15px',color:'#f6edcf',stroke:'#17212a',strokeThickness:4}).setOrigin(.5,0).setDepth(8);
 }
 // Keep the hero out of the atlas lineup while using the actual live renderer.
 scene.x=600;scene.y=760;scene.render();scene.cameras.main.centerOn(600,380);
 document.body.dataset.uniquePoseCounts=ZOMBIE_SPRITES.map(id=>new Set(Array.from({length:49},(_,i)=>i).map(frame=>(scene.textures.get(`enemy-${id}-${frame}`).getSourceImage() as HTMLCanvasElement).toDataURL())).size).join(',');
 document.body.dataset.headStable=ZOMBIE_SPRITES.map(id=>{
  const patch=(f:number)=>{const c=scene.textures.get(`enemy-${id}-${f}`).getSourceImage() as HTMLCanvasElement;return Array.from(c.getContext('2d')!.getImageData(58,28,10,12).data).join(',');};
  const idle=patch(0);return Array.from({length:49},(_,f)=>patch(f)).every(p=>p===idle);
 }).join(',');
 if(new URLSearchParams(location.search).has('walk')){
  const origins=scene.enemies.filter(e=>e.active).map(e=>({e,x:e.x,y:e.y}));let last=performance.now(),travel=0;
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;scene.elapsed+=dt;travel+=dt*30;
   const forward=Math.floor(travel/60)%2===0,offset=forward?travel%60:60-travel%60;
   for(const {e,x,y} of origins){e.x=x+offset-30;e.y=y;}
   scene.visuals.render(scene.enemies,scene.hero,scene.weapon,forward?100000:-100000,380,0,scene.elapsed,0,0,0,false,0,scene.ammo);
   requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
 }
 document.body.dataset.spriteCount=String(ZOMBIE_SPRITES.length);
 document.body.dataset.atlasLoaded=String(ZOMBIE_ATLASES.every(atlas=>scene.textures.exists(atlas.key)));
},50);
