import {artImage,heroFigureImage} from './art';
import {upgradeRole,UPGRADES,type Upgrade} from './upgrades';
import {CARD_EVOLUTIONS} from './card-evolutions';
import type {HeroId,WeaponId} from './config';
const UPGRADE_ICONS:Record<string,string>={health:'\u2665',speed:'\u2197',crit:'\u2726',magnet:'\u25ce',regen:'\u271a',ward:'\u25c7',fire:'\u2600',orbit:'\u2737',damage:'\u2694',wide:'\u25d4',double:'\u2161',cooldown:'\u27a4',trail:'\u25b0',clone:'\u2667',smoke:'\u25c9','dragon-slash':'\u2668',range:'\u2194',bleed:'\u2022',counter:'\u25c8',wind:'\u224b',magazine:'\u25a3',pierce:'\u2192',ricochet:'\u2311',explosive:'\u2739',reload:'\u21bb',stamina:'\u25a3',block:'\u25d2',reflect:'\u21c4',spikes:'\u2737',rush:'\u25c9',heal:'\u271a'};
const FULL_CARD_IDS:Partial<Record<HeroId,readonly string[]>>={
 ninja:['health','speed','crit','magnet','regen','ward','fire','orbit','damage','wide','double','cooldown','trail','clone','smoke'],
 samurai:['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown','range','bleed','counter','wind','dragon-slash'],
 gunner:['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown','magazine','pierce','ricochet','explosive','reload'],
 tank:['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown','stamina','block','reflect','spikes','rush']
};
const upgradeIcon=(u:Upgrade)=>UPGRADE_ICONS[u.evolves||u.id]||'\u2726';
export function upgradeVisual(u:Upgrade,hero:HeroId,weapon:WeaponId){
 const baseId=u.evolves||u.id;
 if(!u.evolves&&baseId==='wide')return `<div class="upgrade-demo upgrade-concept-demo" role="img" aria-label="${u.name} effect artwork"><img class="upgrade-reference-art" src="/assets/card-concepts/crescent-cut-v1.png" alt=""/></div>`;
 if(baseId==='trail')return `<div class="upgrade-demo upgrade-concept-demo" role="img" aria-label="${u.name} Moon Blossom dash artwork"><img class="upgrade-reference-art" src="/assets/card-concepts/moon-blossom-dash.svg" alt=""/></div>`;
 const concepts:Record<string,[number,number]>={damage:[160,80],health:[590,80],double:[1010,80],orbit:[160,536],speed:[590,536],regen:[1010,536]};
 if(!u.evolves&&concepts[baseId]){const [x,y]=concepts[baseId];return `<div class="upgrade-demo upgrade-concept-demo" role="img" aria-label="${u.name} effect artwork"><svg viewBox="${x} ${y} 360 320" preserveAspectRatio="xMidYMid slice" style="overflow:hidden" aria-hidden="true"><defs><clipPath id="card-art-${baseId}"><rect x="${x}" y="${y}" width="360" height="320"/></clipPath></defs><image clip-path="url(#card-art-${baseId})" href="/assets/card-concepts/skill-art-v1.webp" width="1536" height="1024" style="max-width:none"/></svg></div>`;}
 const icons=['crit','magnet','ward','fire','clone','smoke','cooldown','trail','range','bleed','counter','wind','dragon-slash','magazine','pierce','ricochet','explosive','reload','stamina','block','reflect','spikes','rush','heal'];
 const tile=icons.indexOf(baseId);
 if(tile>=0){const x=(tile%6)*256+3,y=Math.floor(tile/6)*256+3;return `<div class="upgrade-demo upgrade-concept-demo" role="img" aria-label="${u.name} effect artwork"><svg viewBox="${x} ${y} 250 250" preserveAspectRatio="xMidYMid slice" style="overflow:hidden" aria-hidden="true"><defs><clipPath id="skill-icon-${baseId}"><rect x="${x}" y="${y}" width="250" height="250"/></clipPath></defs><image clip-path="url(#skill-icon-${baseId})" href="/assets/card-concepts/skill-icons-v1.webp" width="1536" height="1024" style="max-width:none"/></svg></div>`;}
 const kind=['health','heal','regen'].includes(baseId)?'heal':['speed','cooldown','trail'].includes(baseId)?'move':['ward','stamina','block','reflect'].includes(baseId)?'guard':['magnet','magazine','reload'].includes(baseId)?'utility':baseId==='orbit'?'orbit':baseId==='fire'?'fire':'attack';
 return `<div class="upgrade-demo upgrade-demo-${kind} effect-${baseId} ${u.evolves?'evolved-card-demo':''}" role="img" aria-label="${u.name} effect demonstration"><span class="upgrade-actor">${artImage('hero',hero)}</span><span class="upgrade-weapon">${artImage('weapon',weapon)}</span><span class="upgrade-zombie">${artImage('enemy','basic')}</span>${['pierce','wind','ricochet','explosive','double','wide','range','fire','reflect','bleed','smoke','dragon-slash'].includes(baseId)?`<svg class="upgrade-motion" viewBox="0 0 120 80" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5">${baseId==='ricochet'?'<path d="m28 50 45-25 20 32"/>':baseId==='explosive'||baseId==='fire'?'<circle cx="75" cy="45" r="20"/><circle cx="75" cy="45" r="13"/>':baseId==='wide'||baseId==='range'||baseId==='double'?'<path d="M42 16Q88 40 42 64M48 22Q92 40 48 58"/>':baseId==='bleed'?'<path d="M76 32q-12 16 0 19q12-3 0-19Z"/>':'<path d="M25 43h75m-9-6 9 6-9 6"/>'}</g></svg>`:''}<span class="upgrade-effect">${upgradeIcon(u)}</span><span class="upgrade-health"><i></i></span></div>`;
}
export function upgradeValues(u:Upgrade,level:number){
 if(u.evolves)return {before:'MAXED',after:'EVOLVE'};
 const values:Record<string,(n:number)=>string>={smoke:n=>`BLINDING SMOKE ${n}`, 'dragon-slash':n=>`${n*25}% FIRE DAMAGE`,health:n=>`+${Math.round((1.15**n-1)*100)}% HP`,speed:n=>`+${n*8}% speed`,crit:n=>`${5+n*7}% critical`,magnet:n=>`+${n*30}% reach`,regen:n=>`${n} HP/sec`,damage:n=>`+${n*12}% damage`,cooldown:n=>`−${n*15}% cooldown`,range:n=>`+${n*25}% reach`,wide:n=>`+${n*25}% arc`,magazine:n=>`+${n*4} rounds`,pierce:n=>`${n} extra targets`,reload:n=>`−${n*20}% reload`,stamina:n=>`+${n*40}% stamina`,spikes:n=>`+${n*30}% bash`,bleed:n=>`${n*5} bleed/sec`,counter:n=>`+${(n*.3).toFixed(1)}s counter`,block:n=>`+${n*25}% guard`,rush:n=>`+${n*25}% slam`,fire:n=>`${n*9} burn/sec`,orbit:n=>`${n*12} hit damage`};
 const value=values[u.id];return value?{before:value(level),after:value(level+1)}:{before:level?'ACTIVE':'NOT ACTIVE',after:({heal:'+30 HP',ward:'BLOCK 1 HIT',double:'SECOND SLASH',trail:'DASH DAMAGE',clone:'SHADOW ALLY',wind:'PIERCING WAVE',ricochet:'BOUNCING SHOT',explosive:'EXPLOSIVE FINISH',reflect:'REFLECT SHOTS'} as Record<string,string>)[u.id]||'UNLOCKED'};
}
export function cardBenefit(u:Upgrade){
 const brief:Record<string,string>={health:'Survive more hits.',speed:'Move out of danger faster.',crit:'Land more powerful critical hits.',magnet:'Collect drops from farther away.',regen:'Recover health while fighting.',ward:'Block the first hit each wave.',fire:'Burn enemies near you.',orbit:'A kunai circles and cuts enemies.',damage:'Every attack hits harder.',wide:'Cut a wider group in front.',double:'Attack again with an echo.',cooldown:'Use your ability more often.',trail:'Hurt enemies along your dash.',clone:'Kills summon a fighting shadow.',smoke:'Drop a bomb to escape and daze nearby enemies.', 'dragon-slash':'Dash forward with a blazing slash.',range:'Hit enemies farther away.',bleed:'Wounds keep dealing damage.',counter:'More time to counter a hit.',wind:'Send a crescent through crowds.',magazine:'Fire longer before reloading.',pierce:'Shoot through more enemies.',ricochet:'Shots bounce to another enemy.',explosive:'The last round explodes.',reload:'Get back to shooting sooner.',stamina:'Keep your shield up longer.',block:'Protect a wider angle.',reflect:'Send enemy shots back.',spikes:'Make shield bashes stronger.',rush:'Make Ground Slam stronger.',heal:'Recover 30 health now.'};
 if(u.evolves){const evolved:Record<string,string>={damage:'Every fifth kill bursts outward.',wide:'Every third attack cuts all around.',double:'Add a third shadow slash.',orbit:'Two kunai orbit around you.',fire:'Burning kills leave fire behind.',magnet:'Pull in drops every 5 seconds.',ward:'Block three hits each wave.',wind:'Launch two piercing crescents.',ricochet:'Shots bounce twice.',speed:'Moving charges a speed burst.',regen:'Elite kills boost recovery.',bleed:'Bleeding kills heal you.',reload:'Reloading grants a speed burst.',spikes:'Every third bash makes a shockwave.',explosive:'Final-round blasts grow wider.'};return evolved[u.evolves]||u.description.split(';')[0];}
 return brief[u.id]||u.description;
}
const EXPLAINED_CARDS:Record<string,{title:string;benefit:string;scene:string;description:string}>={
 pierce:{title:'Piercing Shots',benefit:'Hits through enemies',scene:'pierce',description:'One bullet travels through three zombies.'},
 wide:{title:'Wider Slash',benefit:'Catch more enemies in your swing',scene:'wide',description:'A wide slash reaches several zombies; the dotted arc shows the old width.'},
 health:{title:'More Health',benefit:'+15% maximum HP',scene:'health',description:'A red heart and an extended health bar show more maximum health.'},
 regen:{title:'Regeneration',benefit:'Recover HP over time',scene:'regen',description:'Green healing marks refill missing health segments.'}
};
function explainedCard(u:Upgrade,index:number,hero:HeroId,weapon:WeaponId,level:number){
 const design=EXPLAINED_CARDS[u.id],value=upgradeValues(u,level);
 const stars=Array.from({length:5},(_,i)=>`<span class="${i<level?'filled':''} ${i>=u.max?'locked':''}" aria-hidden="true">\u2605</span>`).join('');
 const role=upgradeRole(u),category=role==='offence'?'DAMAGE':role==='survival'?'SURVIVAL':'TECHNIQUE';
 return `<button class="upgrade choice-card explain-card" data-action="upgrade:${index}" aria-label="Choose ${design.title}: ${design.benefit}. ${value.after}. Level ${level} to ${level+1}">
 <span class="explain-art art-${design.scene}" role="img" aria-label="${design.description}">
 <span class="explain-hero">${heroFigureImage(hero)}</span>
 ${['pierce','wide'].includes(u.id)?`<span class="explain-weapon">${artImage('weapon',weapon)}</span>`:''}
 </span>
 <span class="choice-top"><small>${category}</small>${level===0?'<b class="choice-new">NEW</b>':`<kbd>${index+1}</kbd>`}</span>
 <h3>${design.title}</h3>
 <span class="card-benefit">${design.benefit}</span>
 <strong class="choice-value">${value.after}</strong>
 <span class="choice-level">LV ${level} · MAX ${u.max}</span>
 <span class="choice-stars" role="img" aria-label="${level} of ${u.max} levels">${stars}</span>
 <span class="explain-level">LEVEL ${level} <span aria-hidden="true">→</span> ${level+1}<small>MAX ${u.max}</small></span>
 </button>`;
}
export function visualUpgradeCard(u:Upgrade,index:number,_hero:HeroId,_weapon:WeaponId,level:number,_combo='',preview=false){

 const v=upgradeValues(u,level),role=upgradeRole(u);
 const category=u.evolves?'EVOLUTION':role==='offence'?'DAMAGE':role==='survival'?'SURVIVAL':'TECHNIQUE';
 const maxStars=Number.isFinite(u.max)?u.max:5;
 const stars=Array.from({length:5},(_,i)=>`<span class="${i<level?'filled':''} ${i>=u.max?'locked':''}" aria-hidden="true">\u2605</span>`).join('');
 const tag=preview?'article':'button',action=preview?'':` data-action="upgrade:${index}"`;
 const hasDesignedArt=!u.evolves&&(FULL_CARD_IDS[_hero]||[]).includes(u.id);
 return `<${tag} class="upgrade choice-card ${hasDesignedArt?'levelup-designed-card':''} ${preview?'preview-card':''} ${u.evolves?'evolution-card':''}" data-card-role="${role}"${action} aria-label="${preview?'Preview':'Choose'} ${u.name}: ${cardBenefit(u)}. ${v.after}. ${level} of ${maxStars} levels">
  <span class="choice-top"><small>${category}</small>${level===0?'<b class="choice-new">NEW</b>':`<kbd>${index+1}</kbd>`}</span>
  <h3>${u.name}</h3>
  ${upgradeVisual(u,_hero,_weapon)}
  <span class="card-benefit">${u.evolves?cardBenefit(u):u.description}</span>
  ${!preview?`<span class="choice-comparison"><span>${v.before}</span><i aria-hidden="true">→</i><strong>${v.after}</strong></span>${_combo?`<span class="choice-combo">✦ ${_combo}</span>`:''}<span class="choice-evolution-progress">${!u.evolves&&Number.isFinite(u.max)?`<span class="reward-progress-pips" aria-hidden="true">${Array.from({length:u.max},(_,i)=>`<i class="${i<level?'earned':i===level?'next':''}"></i>`).join('')}</span>`:''}<span>${evolutionProgress(u,level)}</span></span>`:`<strong class="choice-value">${v.after}</strong>`}
  <span class="choice-level">LV ${level} · ${u.evolves?'EVOLUTION':`MAX ${u.max}`}</span>
  <span class="choice-stars" role="img" aria-label="${level} of ${maxStars} levels">${stars}</span>
 </${tag}>`;
}

export function evolutionProgress(u:Upgrade,level:number){
 if(u.evolves)return '✦ Evolution ready';
 if(!CARD_EVOLUTIONS[u.id])return Number.isFinite(u.max)?`Upgrade ${Math.min(level+1,u.max)} of ${u.max}`:'Instant recovery';
 const remaining=u.max-level-1,name=CARD_EVOLUTIONS[u.id].name;
 return remaining===0?`✦ ${name} · eligible from wave 11`:remaining===1?`1 level to ${name} · wave 11+`:`${remaining} levels to ${name} · wave 11+`;
}
export function upgradeBuildHint(u:Upgrade,levels:Record<string,number>){
 const pairs:Record<string,string[]>={double:['wide','damage'],wide:['double','orbit'],orbit:['damage','fire'],fire:['rush','orbit'],pierce:['ricochet','damage'],ricochet:['pierce'],explosive:['reload'],reload:['explosive','magazine'],magazine:['reload'],wind:['bleed','range'],bleed:['wind'],counter:['cooldown'],reflect:['block','stamina'],block:['reflect'],spikes:['stamina'],rush:['fire'],trail:['cooldown','speed'],clone:['double']};
 const paired=(pairs[u.evolves||u.id]||[]).find(id=>(levels[id]||0)>0&&id!==(u.evolves||u.id));
 return paired?`Pairs with your ${UPGRADES.find(c=>c.id===paired)!.name}`:'';
}
