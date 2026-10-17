import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
let game:Phaser.Game|undefined;let attempts=0;
function run(){
 game?.destroy(true);const begun=performance.now();const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
 const create=scene.create.bind(scene);scene.create=()=>{create();scene.paused=true;const count=scene.textures.getTextureKeys().length;if(count>100)throw Error('Startup eagerly generated animation frames');const key='skill-robot-boss-slam-17-small';scene.visuals.prepareTexture(key);if(!scene.textures.exists(key))throw Error('Late boss frame was not generated');document.querySelector('#results')!.textContent=`Attempt ${++attempts}: ${Math.round(performance.now()-begun)} ms to ready\n${count} textures prepared\nPASS: startup budget and on-demand boss animation`;};
 game=new Phaser.Game({type:Phaser.CANVAS,parent:'fixture',width:600,height:400,scene:[scene],audio:{noAudio:true}});
}
document.querySelector('#retry')!.addEventListener('click',run);run();
