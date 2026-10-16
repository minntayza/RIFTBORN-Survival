import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {wrecksNear} from '../src/map-ground';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth,height:innerHeight,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},render:{antialias:true},audio:{noAudio:true}});
let moving=true,crowd=new URLSearchParams(location.search).has('crowd'),t=0,frames=0,maxRotation=0;
const origin={x:600,y:380};
function setup(){for(const e of scene.enemies)e.active=false;scene.hp=scene.maxHp=99999;scene.x=origin.x;scene.y=origin.y;for(let i=0;i<(crowd?16:1);i++){const e=scene.spawn('basic')!;e.x=origin.x+150+Math.cos(i*2.4)*70;e.y=origin.y+Math.sin(i*2.4)*100;e.flash=0;e.telegraph=0;e.attack=3;}scene.drawFloor();}
const ready=setInterval(()=>{if(!scene.visuals)return;clearInterval(ready);scene.paused=true;scene.save.settings.mapView=2;scene.applyMapView();if(crowd){const car=wrecksNear(600,380).find(c=>c.x>0&&c.y>0)!;origin.x=car.x+100;origin.y=car.y+30;}setup();let last=performance.now();
 const tick=(now:number)=>{const dt=Math.min(.04,(now-last)/1000);last=now;t+=dt;scene.elapsed+=dt;frames++;
  if(moving){const nx=origin.x+Math.sin(t*.8)*190,ny=origin.y+Math.sin(t*1.3)*110;const p=scene.moveOnGround(scene.x,scene.y,nx-scene.x,ny-scene.y,17);scene.x=p.x;scene.y=p.y;}
  scene.updateEnemies(dt);scene.render();scene.cameras.main.centerOn(origin.x,origin.y);
  for(const o of scene.children.getChildren())if(o instanceof Phaser.GameObjects.Image&&o.visible&&o.texture.key.startsWith('enemy-basic-'))maxRotation=Math.max(maxRotation,Math.abs(o.rotation));
  document.querySelector('output')!.textContent=`Actual enemy pursuit · ${frames} frames · body rotation ${maxRotation.toFixed(3)} · ${crowd?'16 zombies + car':'single Wanderer'}`;
  document.body.dataset.maxRotation=String(maxRotation);document.body.dataset.frames=String(frames);
  requestAnimationFrame(tick);
 };requestAnimationFrame(tick);
},50);
document.querySelector('#single')!.addEventListener('click',()=>{crowd=false;setup();});
document.querySelector('#crowd')!.addEventListener('click',()=>{crowd=true;const car=wrecksNear(600,380).find(c=>c.x>0&&c.y>0)!;origin.x=car.x+100;origin.y=car.y+30;setup();});
document.querySelector('#zoom')!.addEventListener('click',()=>{scene.save.settings.mapView=scene.save.settings.mapView===2?1:2;scene.applyMapView();document.querySelector('#zoom')!.textContent=scene.save.settings.mapView+'×';});
document.querySelector('#route')!.addEventListener('click',()=>{moving=!moving;document.querySelector('#route')!.textContent=moving?'Stop hero':'Move hero';});
