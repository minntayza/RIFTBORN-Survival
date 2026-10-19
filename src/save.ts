import {COSMETICS} from './cosmetics';
import type { TechniqueId,RunMode,BuildId } from './retention';
import { HEROES, WEAPONS, PERMANENT, type HeroId, type WeaponId } from './config';
export type Save = {
    runSetup:{mode:RunMode;build:BuildId};
    version: 1;
    archive: Record<string,1|2>;
    gold: number;
    petals:number;
    cosmetics:{owned:string[];equipped:Record<string,string>};
    heroes: HeroId[];
    weapons: WeaponId[];
    hero: HeroId;
    weapon: WeaponId;
    permanent: Record<string, number>;
    bestWave: number;
    bestTime: number;
    bestKills: number;
    techniques: Partial<Record<HeroId,TechniqueId>>;
    daily: Record<string,{score:number;wins:number}>;
    shortWins: number;
    mastery: Record<string, Record<string, number>>;
    settings: {
        sound: boolean;
        music: boolean;
        shake: boolean;
        aimAssist:boolean;
        joystickSide:'left'|'right';
        joystickSize: number;
        mapView:1|2;
        mapViewChosen?: boolean;
    };
};
export const defaultMapView = (): 1|2 => typeof matchMedia !== 'undefined' && (matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints > 0) ? 2 : 1;
export const freshSave = (): Save => ({ version: 1, runSetup:{mode:'endless',build:'assault'}, archive:{}, petals:0, cosmetics:{owned:[],equipped:{}}, gold: 0, heroes: ['ninja'], weapons: ['katana', 'nodachi', 'pistols', 'shield'], hero: 'ninja', weapon: 'katana', permanent: {}, bestWave: 0, bestTime: 0, bestKills: 0, mastery: {}, techniques:{},daily:{},shortWins:0, settings: { sound: true, music: true, shake: true,aimAssist:true,joystickSide:'left',joystickSize:115,mapView:defaultMapView() } });
const num = (x: unknown, max = 1e9) => typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.min(max, Math.floor(x))) : 0;
export const compatible = (h: HeroId, w: WeaponId) => WEAPONS[w]?.hero === h;
export function validateSave(raw: unknown): Save { const d = freshSave(); if (!raw || typeof raw !== 'object')
    return d; const r = raw as Partial<Save>; if (r.version !== 1)
    return d; d.gold = num(r.gold); d.heroes = Array.from(new Set(['ninja' as HeroId, ...(Array.isArray(r.heroes) ? r.heroes.filter(h => typeof h === 'string' && Object.hasOwn(HEROES, h)) : [])])); d.weapons = Array.from(new Set([...d.weapons, ...(Array.isArray(r.weapons) ? r.weapons.filter(w => typeof w === 'string' && Object.hasOwn(WEAPONS, w)) : [])])); d.hero = r.hero && d.heroes.includes(r.hero) ? r.hero : 'ninja'; d.weapon = r.weapon && d.weapons.includes(r.weapon) && compatible(d.hero, r.weapon) ? r.weapon : d.weapons.find(w => compatible(d.hero, w))!; for (const [k, v] of Object.entries(PERMANENT))
    d.permanent[k] = num(r.permanent?.[k], v.cap); d.bestWave = num(r.bestWave); d.bestTime = num(r.bestTime); d.bestKills = num(r.bestKills); if (r.mastery && typeof r.mastery === 'object')
    for (const h of Object.keys(HEROES)) {
        const m = r.mastery[h];
        if (m && typeof m === 'object')
            d.mastery[h] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, num(v)]));
    }
    if(r.archive&&typeof r.archive==='object')for(const [k,v] of Object.entries(r.archive))if(/^(card|weapon):[a-z]+(?::[a-z]+)?$/.test(k)&&(v===1||v===2))d.archive[k]=v;
    if(['endless','short','daily'].includes(r.runSetup?.mode||''))d.runSetup.mode=r.runSetup!.mode;
    if(['assault','mobility','guard'].includes(r.runSetup?.build||''))d.runSetup.build=r.runSetup!.build;
    d.petals=num(r.petals);
    d.cosmetics.owned=Array.isArray(r.cosmetics?.owned)?Array.from(new Set(r.cosmetics.owned.filter(id=>COSMETICS.some(c=>c.id===id)))):[];
    if(r.cosmetics?.equipped&&typeof r.cosmetics.equipped==='object')for(const c of COSMETICS)if(d.cosmetics.owned.includes(c.id)&&r.cosmetics.equipped[`${c.kind}:${c.target}`]===c.id)d.cosmetics.equipped[`${c.kind}:${c.target}`]=c.id;
    d.shortWins=num(r.shortWins);
    for(const h of Object.keys(HEROES) as HeroId[]){const t=r.techniques?.[h];if(t==='standard'||t==='swift'||t==='fortified')d.techniques[h]=t;}
    if(r.daily&&typeof r.daily==='object')for(const [date,record] of Object.entries(r.daily).filter(([date])=>/^\d{4}-\d{2}-\d{2}$/.test(date)).sort().slice(-31)){if(record&&typeof record==='object')d.daily[date]={score:num(record.score),wins:num(record.wins)};}
    for (const k of ['sound', 'music', 'shake','aimAssist'] as const)
    if (typeof r.settings?.[k] === 'boolean')
        d.settings[k] = r.settings[k]; d.settings.joystickSide=r.settings?.joystickSide==='right'?'right':'left';d.settings.joystickSize=[95,115,135].includes(r.settings?.joystickSize||0)?r.settings!.joystickSize:115;d.settings.mapViewChosen=r.settings?.mapViewChosen===true;d.settings.mapView=d.settings.mapViewChosen?(r.settings?.mapView===2?2:1):defaultMapView();return d; }
const KEY = 'zombie-last-stand.v1';
export const loadSave = () => { try {
    return validateSave(JSON.parse(localStorage.getItem(KEY) || 'null'));
}
catch {
    return freshSave();
} };
export function storeSave(s: Save) { try {
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
}
catch {
    return false;
} }
export function purchase(s: Save, kind: 'heroes' | 'weapons' | 'permanent', id: string): boolean { let cost = 0; if (kind === 'heroes') {
    if (!Object.hasOwn(HEROES, id) || s.heroes.includes(id as HeroId))
        return false;
    cost = HEROES[id as HeroId].price;
}
else if (kind === 'weapons') {
    if (!Object.hasOwn(WEAPONS, id) || s.weapons.includes(id as WeaponId))
        return false;
    cost = WEAPONS[id as WeaponId].price;
}
else {
    const p = Object.hasOwn(PERMANENT, id) ? PERMANENT[id as keyof typeof PERMANENT] : undefined;
    if (!p || (s.permanent[id] || 0) >= p.cap)
        return false;
    cost = 250 + 150 * (s.permanent[id] || 0);
} if (s.gold < cost)
    return false; s.gold -= cost; if (kind === 'permanent')
    s.permanent[id] = (s.permanent[id] || 0) + 1;
else
    (s[kind] as string[]).push(id); return true; }
