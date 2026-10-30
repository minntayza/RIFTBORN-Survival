import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PyusawhtiCombat} from '../src/pyusawhti-combat';
import {WEAPONS} from '../src/config';
import type {ArenaScene,Enemy} from '../src/combat';
function setup(levels:Record<string,number>={},evolved:string[]=[]){
 const hits:{enemy:Enemy;damage:number}[]=[];
 const graphics={setDepth(){return this;}};
 const scene={x:100,y:100,angle:0,hero:'pyusawhti',paused:false,ended:false,countdown:0,swing:0,attackSequence:0,weapon:'aungzeyabow',options:{},save:{pyusawhtiSkills:['banepierce','windfocus']},add:{graphics:()=>graphics},u:(id:string)=>levels[id]||0,evolved:(id:string)=>evolved.includes(id),audio:{play:()=>{}},notifyCombat:()=>{},cameras:{main:{shake:()=>{}}},enemies:[] as Enemy[],firePatches:[],burst:()=>{},invuln:0,hit:(e:Enemy,damage:number)=>{hits.push({enemy:e,damage});e.hp-=damage;if(e.hp<=0)e.active=false;}} as unknown as ArenaScene;
 return {scene,combat:new PyusawhtiCombat(scene),hits};
}
function shoot(c:PyusawhtiCombat,s:ArenaScene){s.swing=0;c.bowAttack();c.releasePendingShots(.075);}
function enemy(x:number,y:number,type='basic',hp=1000){return {x,y,r:8,type,hp,active:true,stagger:0} as Enemy;}
test('side arrows cap at six and deal 35%; evolved volley happens every fourth bow attack',()=>{
 const {scene,combat}=setup({arrowstorm:9},['arrowstorm']);
 for(let shot=1;shot<=8;shot++){combat.arrows.length=0;shoot(combat,scene);assert.equal(combat.arrows.length,shot%4===0?8:7);const [main,...side]=combat.arrows;for(const arrow of side)assert.ok(Math.abs(arrow.damage/main.damage-.35)<1e-8);if(shot%4===0)assert.ok(side.some(a=>Math.cos(a.angle)<-.99));}
});
test('Falcon Stride caps at 45% speed and 15% spell reduction; pierce increases by one',()=>{
 const {scene,combat}=setup({windfocuscard:3,piercingeye:3});shoot(combat,scene);assert.equal(combat.arrows[0].vx,700*1.45);assert.equal(combat.arrows[0].pierce,4);combat.activate(1);assert.equal(combat.cooldowns[1],12*.85);assert.equal(combat.windFocusTime,5);
 const evolved=setup({},['piercingeye']);shoot(evolved.combat,evolved.scene);assert.equal(evolved.combat.arrows[0].pierce,Infinity);assert.equal(evolved.combat.arrows.length,1);
});
test('sunburst chance caps at 45% and simultaneous hits share a 0.5s cooldown',()=>{
 const original=Math.random;
 try{Math.random=()=>.46;const noProc=setup({sunburstcard:99});shoot(noProc.combat,noProc.scene);assert.equal(noProc.combat.arrows[0].sunburst,false);
 Math.random=()=>.1;const {scene,combat}=setup({sunburstcard:3,arrowstorm:3},['sunburstcard']);shoot(combat,scene);
 scene.enemies=combat.arrows.map(a=>enemy(a.x,a.y));combat.update(0);assert.equal(combat.bursts.length,1);assert.equal(combat.bursts[0].radius,110);assert.equal(combat.fields.filter(f=>f.kind==='sun').length,1);
 combat.arrows.length=0;shoot(combat,scene);scene.enemies=[enemy(combat.arrows[0].x,combat.arrows[0].y)];combat.update(0);assert.equal(combat.bursts.length,1);
 combat.arrows.length=0;combat.update(.5);shoot(combat,scene);scene.enemies=[enemy(combat.arrows[0].x,combat.arrows[0].y)];combat.update(0);assert.equal(combat.bursts.length,2);
 }finally{Math.random=original;}
});
test('Bane Slayer applies once and Legend rewards attack speed without invulnerability',()=>{
 const {scene,combat,hits}=setup({beasthunter:3},['beasthunter']);shoot(combat,scene);const a=combat.arrows[0];scene.enemies=[enemy(a.x,a.y,'elite',1)];combat.update(0);assert.equal(hits[0].damage,WEAPONS.aungzeyabow.damage*1.45);assert.equal(combat.legendTime,3);assert.equal(combat.attackRateMultiplier,1.25);assert.equal(scene.invuln,0);
 combat.arrows.length=0;combat.update(1);shoot(combat,scene);scene.enemies=[enemy(combat.arrows[0].x,combat.arrows[0].y,'commander',1)];combat.update(0);assert.equal(combat.legendTime,2);
});
test('overlapping evolution fields do not stack; fields expire and pause freezes them',()=>{
 const {scene,combat,hits}=setup();scene.enemies=[enemy(100,100)];
 for(let i=0;i<20;i++)combat.fields.push({x:100,y:100,life:2,radius:55,kind:i%2?'sun':'gale'});
 combat.update(0);assert.equal(hits.length,1);assert.equal(hits[0].damage,WEAPONS.aungzeyabow.damage*.2*.25);
 scene.paused=true;combat.update(5);assert.equal(combat.fields.length,20);scene.paused=false;combat.update(3);assert.equal(combat.fields.length,0);
});
