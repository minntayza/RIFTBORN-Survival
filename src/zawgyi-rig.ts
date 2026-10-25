import {RUBY_SUN,rubySunTexture} from './ruby-sun-art';
import type Phaser from 'phaser';
import {zawgyiGameplayPart,ZAWGYI_ATLAS} from './zawgyi-rig-art';
import {zawgyiMotion,zawgyiWorldPoint,ZAWGYI_SCALE,type ZawgyiPart} from './zawgyi-motion';
export class ZawgyiRig {
 private chargeMarks;
 private sprites=new Map<ZawgyiPart,Phaser.GameObjects.Image>();
 constructor(private scene:Phaser.Scene){this.chargeMarks=scene.add.graphics();const image=scene.textures.get(ZAWGYI_ATLAS.key).getSourceImage() as HTMLImageElement;for(const part of zawgyiMotion(0).parts){const key=`zawgyi-part-${part.part}`;if(!scene.textures.exists(key))scene.textures.addCanvas(key,zawgyiGameplayPart(image,part.part));this.sprites.set(part.part,scene.add.image(0,0,key));}}
 campLayer(offset:number){this.chargeMarks.setDepth(3.101+offset);let i=0;for(const sprite of this.sprites.values())sprite.setDepth(3+i++*.025+offset);}
 render(x:number,y:number,aim:number,time:number,moving:boolean,attack:number,sequence:number,lift:number,_invuln:number,slam=-1,ruby=false,charges=0){this.chargeMarks.clear();
 if(ruby&&this.scene.textures.exists(RUBY_SUN.key)&&!this.scene.textures.exists('zawgyi-ruby-sun-filtered'))this.scene.textures.addCanvas('zawgyi-ruby-sun-filtered',rubySunTexture(this.scene.textures.get(RUBY_SUN.key).getSourceImage() as HTMLImageElement));
 const flip=Math.cos(aim)<0;for(const [i,p] of zawgyiMotion(time,moving,attack,sequence,slam,aim).parts.entries()){const world=zawgyiWorldPoint(p,x,y,aim,lift),sprite=this.sprites.get(p.part)!;const evolved=p.part==='staff'&&ruby&&this.scene.textures.exists('zawgyi-ruby-sun-filtered');sprite.setTexture(evolved?'zawgyi-ruby-sun-filtered':`zawgyi-part-${p.part}`);
 sprite.setOrigin(flip?1-p.ox:p.ox,p.oy).setDisplaySize((evolved?RUBY_SUN.width:p.width)*ZAWGYI_SCALE,p.height*ZAWGYI_SCALE).setPosition(world.x,world.y).setRotation(p.rotation*(flip?-1:1)).setFlipX(flip).setAlpha(1).clearTint().setDepth(3+i*.025);
 if(evolved){for(let n=0;n<charges;n++){const rotation=p.rotation*(flip?-1:1),offset=(-p.height*p.oy+48+n*11)*ZAWGYI_SCALE,mx=world.x-Math.sin(rotation)*offset,my=world.y+Math.cos(rotation)*offset;this.chargeMarks.fillStyle(0xffd45a,1);this.chargeMarks.fillCircle(mx,my,2);this.chargeMarks.fillStyle(0xfff2a5,1);this.chargeMarks.fillCircle(mx-.4,my-.5,.8);}this.chargeMarks.setDepth(3+i*.025+.001);}
 }}
}
