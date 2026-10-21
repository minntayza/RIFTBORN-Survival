import type Phaser from 'phaser';
import {zawgyiGameplayPart,ZAWGYI_ATLAS} from './zawgyi-rig-art';
import {zawgyiMotion,zawgyiWorldPoint,ZAWGYI_SCALE,type ZawgyiPart} from './zawgyi-motion';
export class ZawgyiRig {
 private sprites=new Map<ZawgyiPart,Phaser.GameObjects.Image>();
 constructor(private scene:Phaser.Scene){const image=scene.textures.get(ZAWGYI_ATLAS.key).getSourceImage() as HTMLImageElement;for(const part of zawgyiMotion(0).parts){const key=`zawgyi-part-${part.part}`;if(!scene.textures.exists(key))scene.textures.addCanvas(key,zawgyiGameplayPart(image,part.part));this.sprites.set(part.part,scene.add.image(0,0,key));}}
 render(x:number,y:number,aim:number,time:number,moving:boolean,attack:number,sequence:number,lift:number,_invuln:number,slam=-1){const flip=Math.cos(aim)<0;for(const [i,p] of zawgyiMotion(time,moving,attack,sequence,slam,aim).parts.entries()){const world=zawgyiWorldPoint(p,x,y,aim,lift),sprite=this.sprites.get(p.part)!;sprite.setOrigin(flip?1-p.ox:p.ox,p.oy).setDisplaySize(p.width*ZAWGYI_SCALE,p.height*ZAWGYI_SCALE).setPosition(world.x,world.y).setRotation(p.rotation*(flip?-1:1)).setFlipX(flip).setAlpha(1).clearTint().setDepth(3+i*.025);}}
}
