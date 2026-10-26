import {skillIcon} from './skill-icons';
import {samuraiPortrait} from './samurai-art';
import {ninjaSkinPortrait} from './ninja-cosmetics';
import {gunnerSkinPortrait} from './gunner-cosmetics';
import {tankSkinPortrait} from './tank-cosmetics';
import type {Save} from './save';
import type {HeroId} from './config';
import {COSMETICS} from './cosmetics';
import {styles,type CosmeticEffectProfile} from './cosmetic-effect-profiles';
export type OutfitProfile=CosmeticEffectProfile&{hero:HeroId;theme:string};
const names:Record<HeroId,readonly string[]>={zawgyi:[],pyusawhti:[],lethwei:[],kyansittha:[],ninja:['Inkleaf Escape','Street Flash','Hologram Dash'],samurai:['Blossom Promise','Fox Spirit Guard','Moonlit Counter'],gunner:['Lucky Star Rush','Arcade Overdrive','Comet Courier'],tank:['Crownfall','Dwarven Runeforge','Snowglobe Slam']};
export function outfitEffectProfile(save:Save,hero:HeroId):OutfitProfile|undefined{
 const id=save.cosmetics.equipped[`character:${hero}`];if(!id||!save.cosmetics.owned.includes(id))return;
 if(!COSMETICS.some(c=>c.id===id&&c.kind==='character'&&c.target===hero&&c.asset))return;
 const theme=id.split(':').at(-1)!,style=styles[`${hero}:${theme}`];if(!style)return;
 return {id,hero,theme,motif:style[0],color:style[1],accent:style[2],name:names[hero][['sakura','jade','starlight'].indexOf(theme)]};
}
export function outfitUltimateIcon(save:Save,hero:HeroId,base:string){
 const p=outfitEffectProfile(save,hero);
 if(!p)return base;
 const id=base.match(/data-skill-icon="([^"]+)"/)?.[1];
 if(id)return skillIcon(id,hero,p.theme);
 const symbols:Record<string,string>={petal:'✿',fox:'◆',moon:'☾',leaf:'❧',chevron:'»',chip:'◇',coin:'★',note:'♪',planet:'✧',crown:'♛',rune:'ᛟ',snow:'❄'};
 const color='#'+p.color.toString(16).padStart(6,'0');
 return `<span class="outfit-ultimate-art" data-outfit="${hero}-${p.theme}" style="--outfit-glow:${color}" title="${p.name}">${base}<svg class="outfit-crest" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="#20323a" stroke="${color}" stroke-width="2"/><text x="14" y="19" text-anchor="middle" font-size="19" fill="${color}">${symbols[p.motif]||'★'}</text></svg></span>`;
}
