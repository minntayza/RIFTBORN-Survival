import type {Save} from './save';
import {WEAPONS,type WeaponId} from './config';
import {COSMETICS} from './cosmetics';
export type CosmeticMotif='petal'|'fox'|'moon'|'leaf'|'chevron'|'chip'|'coin'|'note'|'planet'|'crown'|'rune'|'snow';
export type CosmeticEffectProfile={id:string;motif:CosmeticMotif;color:number;accent:number;name:string};
const styles:Record<string,readonly [CosmeticMotif,number,number,string]>={
 'samurai:sakura':['petal',0xffa9ce,0xffecae,'Blossom Dance'],'samurai:jade':['fox',0xffcc73,0x9be2c1,'Foxfire Waltz'],'samurai:starlight':['moon',0xc6caff,0xffefbd,'Moonlit Wishes'],
 'ninja:sakura':['leaf',0xb4d1aa,0xffdda0,'Hidden Garden'],'ninja:jade':['chevron',0xff8caa,0xc2a6ff,'Street Spark'],'ninja:starlight':['chip',0x7af1ff,0xdfc5ff,'Neon Comet'],
 'gunner:sakura':['coin',0xffda83,0xfff0c6,'Lucky Stars'],'gunner:jade':['note',0x7ef0dd,0xff9da7,'Arcade Pop'],'gunner:starlight':['planet',0xc1a3ff,0x8af5ff,'Pocket Galaxy'],
 'tank:sakura':['crown',0xffdd83,0x8ab9ff,'Royal Celebration'],'tank:jade':['rune',0xffb16d,0xffe3a0,'Little Forge'],'tank:starlight':['snow',0xb4ecff,0xe9d6ff,'Snowglobe Guard']
};
export const COSMETIC_FX_LIMIT=144;
export function cosmeticEffectProfile(save:Save,weapon:WeaponId):CosmeticEffectProfile|undefined{
 const id=save.cosmetics.equipped[`weapon:${weapon}`];if(!id||!save.cosmetics.owned.includes(id))return;
 const c=COSMETICS.find(c=>c.id===id&&c.kind==='weapon'&&c.target===weapon);if(!c?.asset)return;
 const style=styles[`${WEAPONS[weapon].hero}:${id.split(':').at(-1)}`];if(!style)return;
 return {id,motif:style[0],color:style[1],accent:style[2],name:style[3]};
}
