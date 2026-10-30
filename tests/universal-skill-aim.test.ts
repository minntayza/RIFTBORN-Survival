import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SkillAim} from '../src/skill-aim';
import {skillAimProfile} from '../src/skill-aim-profile';
test('every survivor can hold, cancel without spending cooldown, and release exactly once',()=>{
 const saved=['window','document'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)] as const);
 const win=new EventTarget(),doc=Object.assign(new EventTarget(),{hidden:false,body:{append(){}},createElement:()=>Object.assign(new EventTarget(),{hidden:true,className:'',type:'',textContent:'',setAttribute(){},remove(){},classList:{remove(){},toggle(){}},getBoundingClientRect:()=>({left:0,top:0,right:10,bottom:10})})});
 Object.assign(globalThis,{window:win,document:doc});
 try{
  const cases={ninja:['shadowdash'],samurai:['counter','draw','mark'],gunner:['overdrive','beacon','breach'],tank:['slam','bulwark','march'],zawgyi:['datlone','flame','slam'],pyusawhti:['multishot','banepierce','windfocus'],lethwei:['blitz','ironchin','lethweiring']};
  for(const [hero,ids]of Object.entries(cases))for(const id of ids){
   let calls=0;const g:any=new Proxy({}, {get:()=>()=>g});
   const controller={equipped:[id,id],cooldowns:[0,0],activate(){calls++;this.cooldowns[0]=5;return true;}};
   const s:any={hero,paused:false,ended:false,countdown:0,ability:0,x:100,y:100,angle:0,save:{settings:{skillCast:'hold',mapView:1}},add:{graphics:()=>g},cameras:{main:{getWorldPoint:()=>({x:180,y:120})}},input:{activePointer:{x:180,y:120},on(){},off(){},mouse:{disableContextMenu(){}}},moveOnGround:(x:number,y:number,dx:number,dy:number)=>({x:x+dx,y:y+dy}),activate(){calls++;this.ability=7;}};
   if(hero!=='ninja')s[hero==='samurai'||hero==='gunner'||hero==='tank'?'heroAbilities':hero==='pyusawhti'?'pyusawhti':hero==='lethwei'?'lethwei':'zawgyi']=controller;
   const aim=new SkillAim(s);assert.ok(aim.keyDown(0,'Space'),hero+':'+id);assert.equal(calls,0);assert.ok(aim.cancel());aim.keyUp('Space');assert.equal(calls,0);
   aim.keyDown(0,'Space');aim.keyUp('Space');aim.keyUp('Space');assert.equal(calls,1,hero+':'+id);
   aim.keyDown(0,'Space');aim.keyUp('Space');assert.equal(calls,1,'cooldown blocks repeat');aim.destroy();
   const profile=skillAimProfile(hero,id);assert.ok(profile.range>0&&Number.isFinite(profile.radius));
  }
 }finally{for(const [key,value]of saved)if(value)Object.defineProperty(globalThis,key,value);else Reflect.deleteProperty(globalThis,key);}
});
