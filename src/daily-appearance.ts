import {COSMETICS} from './cosmetics';
import {defaultMapView,type Save} from './save';
import type {RunOptions} from './retention';
/** A run-local appearance view. All progression writes still reach the real save. */
export function dailyAppearance(save:Save,options:RunOptions):Save{
 if(options.mode!=='daily'||!options.hero)return save;
 const hero=options.hero,weapon=options.weapon!,equipped={...save.cosmetics.equipped};
 delete equipped[`character:${hero}`];delete equipped[`weapon:${weapon}`];
 const choice=(options.seed||0)%4;
 if(choice>0){const outfits=COSMETICS.filter(c=>c.kind==='character'&&c.target===hero);if(outfits[choice-1])equipped[`character:${hero}`]=outfits[choice-1].id;}
 const cosmetics={...save.cosmetics,equipped};
 const settings=save.settings.mapViewChosen?save.settings:{...save.settings,mapView:defaultMapView('daily')};
 return new Proxy(save,{get(target,key,receiver){if(key==='cosmetics')return cosmetics;if(key==='settings')return settings;return Reflect.get(target,key,receiver);}});
}

/** Practice cannot write rewards, mastery, ownership or records back to the player save. */
export function prepareRunSave(save:Save,options:RunOptions){return dailyAppearance(options.practice?structuredClone(save):save,options);}
