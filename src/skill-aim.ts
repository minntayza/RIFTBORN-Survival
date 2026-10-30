import {skillAimProfile} from './skill-aim-profile';
import type {ArenaScene} from './combat';
import {ABILITY_TUNING as T} from './config';
import {targetSkill,resolveSkillTarget,type SkillPoint} from './skill-target';
/** One active aiming gesture, independent of the movement joystick and gameplay timers. */
export class SkillAim{
 private g;private cancelButton=document.createElement('button');private aim?:{slot:number;id:string;key?:string;pointer?:number;origin?:SkillPoint;dragged:boolean;point:SkillPoint;cancelled:boolean};
 constructor(private s:ArenaScene){this.g=s.add.graphics().setDepth(5.8);this.cancelButton.className='skill-aim-cancel';this.cancelButton.type='button';this.cancelButton.textContent='✕ Cancel';this.cancelButton.setAttribute('aria-label','Cancel aimed skill');this.cancelButton.hidden=true;document.body.append(this.cancelButton);this.cancelButton.addEventListener('click',()=>this.cancel());
 window.addEventListener('pointerdown',this.cancelRight);window.addEventListener('pointermove',this.move,{passive:false});window.addEventListener('pointerup',this.up);window.addEventListener('pointercancel',this.pointerCancel);window.addEventListener('blur',this.cancel);window.addEventListener('resize',this.cancel);document.addEventListener('visibilitychange',this.visibility);
 s.input.on('pointerdown',this.rightClick);s.input.mouse?.disableContextMenu();
 }
 private controller(){return this.s.heroAbilities||this.s.zawgyi||this.s.pyusawhti||this.s.lethwei;}
 private usable(slot:number){const controller=this.controller();return !this.s.paused&&!this.s.ended&&this.s.countdown<=0&&(controller?controller.cooldowns[slot]<=0:slot===0&&this.s.ability<=0);}
 private id(slot:number){if(slot!==0&&slot!==1)return undefined;return this.controller()?.equipped[slot]||(this.s.hero==='ninja'&&slot===0?'shadowdash':undefined);}
 private range(id:string){return skillAimProfile(this.s.hero,id).range;}
 private mousePoint(){return this.s.cameras.main.getWorldPoint(this.s.input.activePointer.x,this.s.input.activePointer.y);}
 private forward(id:string){const touch=this.s.touch,d=touch?Math.hypot(touch.x,touch.y):0,a=d>.12?Math.atan2(touch!.y,touch!.x):this.s.angle,r=this.range(id);return{x:this.s.x+Math.cos(a)*r,y:this.s.y+Math.sin(a)*r};}
 keyDown(slot:number,key:string){const id=this.id(slot);if(!id)return false;if(this.aim||!this.usable(slot))return true;if(this.s.save.settings.skillCast==='quick'){this.cast(slot,this.mousePoint());return true;}this.aim={slot,id,key,point:this.mousePoint(),dragged:false,cancelled:false};this.show();return true;}
 keyUp(key:string){if(this.aim?.key===key){this.aim.point=this.mousePoint();this.release();}}
 startTouch(slot:number,e:PointerEvent){const id=this.id(slot);if(!id)return false;e.preventDefault();if(this.aim||!this.usable(slot))return true;if(this.s.save.settings.skillCast==='quick'){this.cast(slot,this.forward(id));return true;}
 this.aim={slot,id,pointer:e.pointerId,origin:{x:e.clientX,y:e.clientY},point:this.forward(id),dragged:false,cancelled:false};(e.currentTarget as HTMLElement|null)?.setPointerCapture?.(e.pointerId);this.show();return true;
 }
 private show(){this.cancelButton.hidden=false;this.render();}
 private cast(slot:number,p:SkillPoint){
  const dx=p.x-this.s.x,dy=p.y-this.s.y,c=this.controller();
  if(this.s.heroAbilities)this.s.heroAbilities.activate(slot,dx,dy,targetSkill(this.id(slot)||'')?p:undefined);
  else if(c)c.activate(slot,dx,dy);
  else if(this.s.hero==='ninja')this.s.activate(dx,dy);
 }

 private release(){const a=this.aim;if(!a)return;const valid=this.usable(a.slot)&&!a.cancelled;const p=a.point;this.cancel();if(valid)this.cast(a.slot,p);}
 cancel=()=>{const had=!!this.aim;this.aim=undefined;this.g.clear();this.cancelButton.hidden=true;this.cancelButton.classList.remove('is-cancel');return had;};
 private visibility=()=>{if(document.hidden)this.cancel();};
 private cancelRight=(e:PointerEvent)=>{if(e.button===2&&this.aim){e.preventDefault();this.cancel();}};
 private rightClick=(p:{rightButtonDown:()=>boolean})=>{if(p.rightButtonDown())this.cancel();};
 private pointerCancel=(e:PointerEvent)=>{if(e.pointerId===this.aim?.pointer)this.cancel();};
 private move=(e:PointerEvent)=>{const a=this.aim;if(a?.pointer!==e.pointerId||!a.origin)return;e.preventDefault();const dx=e.clientX-a.origin.x,dy=e.clientY-a.origin.y,d=Math.hypot(dx,dy);a.dragged ||=d>8;if(a.dragged){const r=this.range(a.id),scale=r/84;a.point={x:this.s.x+dx*scale,y:this.s.y+dy*scale};}const box=this.cancelButton.getBoundingClientRect();a.cancelled=e.clientX>=box.left-12&&e.clientX<=box.right+12&&e.clientY>=box.top-12&&e.clientY<=box.bottom+12;this.cancelButton.classList.toggle('is-cancel',a.cancelled);};
 private up=(e:PointerEvent)=>{if(this.aim?.pointer!==e.pointerId)return;this.move(e);this.release();};
 render(){this.g.clear();const a=this.aim;if(!a)return;if(!this.usable(a.slot)){this.cancel();return;}if(a.key)a.point=this.mousePoint();const s=this.s,g=this.g,profile=skillAimProfile(s.hero,a.id),p=targetSkill(a.id)?resolveSkillTarget(s,a.point,a.id,s.moveOnGround.bind(s)):a.point,color=a.cancelled?0xff8894:0x8de9e0,quiet=s.save.settings.mapView===2;
 if(profile.shape!=='ground'){
  const angle=Math.atan2(p.y-s.y,p.x-s.x),range=profile.range,ux=Math.cos(angle),uy=Math.sin(angle);
  g.lineStyle(1,0xcdebe6,.28);g.strokeCircle(s.x,s.y,range);
  g.lineStyle(quiet?2:2.5,color,.8);
  if(profile.shape==='self'){g.strokeCircle(s.x,s.y,profile.radius);g.lineBetween(s.x-8,s.y,s.x+8,s.y);g.lineBetween(s.x,s.y-8,s.x,s.y+8);}
  else{const end={x:s.x+ux*range,y:s.y+uy*range};
   if(profile.shape==='cone'){const spread=s.hero==='tank'?1.05:.45;for(const sign of [-1,1])g.lineBetween(s.x,s.y,s.x+Math.cos(angle+spread*sign)*range,s.y+Math.sin(angle+spread*sign)*range);g.beginPath();g.arc(s.x,s.y,range,angle-spread,angle+spread);g.strokePath();}
   else{const width=Math.min(24,profile.radius);for(const sign of [-1,1])g.lineBetween(s.x-uy*width*sign,s.y+ux*width*sign,end.x-uy*width*sign,end.y+ux*width*sign);}
   g.lineBetween(s.x,s.y,end.x,end.y);g.strokeCircle(end.x,end.y,8);
  }return;
 }
 g.lineStyle(1,0xcdebe6,.28);g.strokeCircle(s.x,s.y,this.range(a.id));g.lineStyle(quiet?2:2.5,color,.95);g.strokeCircle(p.x,p.y,10);g.lineBetween(p.x-5,p.y,p.x+5,p.y);g.lineBetween(p.x,p.y-5,p.x,p.y+5);
 g.lineStyle(1.5,color,.55);g.strokeCircle(p.x,p.y,a.id==='breach'?T.breach.radius:T.beacon.radius);
 if(a.id==='breach'){const pts=Array.from({length:21},(_,i)=>{const t=i/20;return{x:s.x+(p.x-s.x)*t,y:s.y+(p.y-s.y)*t-Math.sin(t*Math.PI)*30};});g.lineStyle(quiet?2:2.5,color,.8);g.strokePoints(pts,false);}else{g.lineStyle(1.5,color,.55);g.lineBetween(s.x,s.y,p.x,p.y);}
 }
 destroy(){this.cancel();this.g.destroy();this.cancelButton.remove();window.removeEventListener('pointerdown',this.cancelRight);window.removeEventListener('pointermove',this.move);window.removeEventListener('pointerup',this.up);window.removeEventListener('pointercancel',this.pointerCancel);window.removeEventListener('blur',this.cancel);window.removeEventListener('resize',this.cancel);document.removeEventListener('visibilitychange',this.visibility);this.s.input.off('pointerdown',this.rightClick);}
}
