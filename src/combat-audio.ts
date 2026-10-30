/** Original, short physical layers: filtered swish/impact plus a tonal body. */
export type AttackVoice={body:number;air:number;duration:number;gain:number;ring?:number};
const slash={body:180,air:2600,duration:.12,gain:.035};
export const ATTACK_VOICES:Record<string,AttackVoice>={
 katana:{...slash,body:310,duration:.075},dual:{...slash,body:370,duration:.065},kama:{...slash,body:260,duration:.09},
 nodachi:{...slash,body:140,air:1800,duration:.18},cursed:{...slash,body:165,air:1600,duration:.17,ring:610},naginata:{...slash,body:190,air:2100,duration:.2},
 pistols:{body:110,air:1800,duration:.07,gain:.045},shotgun:{body:68,air:1200,duration:.16,gain:.05},smg:{body:155,air:2200,duration:.055,gain:.03},
 shield:{body:94,air:720,duration:.14,gain:.04,ring:420},spiked:{body:110,air:950,duration:.14,gain:.04,ring:520},hammer:{body:58,air:640,duration:.22,gain:.045},
 hempwraps:{body:125,air:1300,duration:.07,gain:.035},'staff-swish':{body:230,air:1800,duration:.12,gain:.025,ring:880},'bow-release':{body:430,air:3500,duration:.075,gain:.035,ring:1250},
};
const IMPACT_VOICES:Record<string,AttackVoice>={
 ninja:{body:260,air:3200,duration:.055,gain:.04},samurai:{body:130,air:2200,duration:.12,gain:.05,ring:760},gunner:{body:145,air:1700,duration:.065,gain:.035},
 tank:{body:72,air:780,duration:.16,gain:.05,ring:390},zawgyi:{body:185,air:1200,duration:.08,gain:.04,ring:990},pyusawhti:{body:270,air:3000,duration:.065,gain:.03,ring:1400},lethwei:{body:95,air:850,duration:.08,gain:.05},
};
export function combatVoice(kind:string,hero:string):AttackVoice|undefined{
 if(['hit','critical','keen-hit','staff-contact'].includes(kind))return IMPACT_VOICES[hero]||IMPACT_VOICES.ninja;
 return ATTACK_VOICES[kind];
}
export const voicePitch=(sequence:number)=>[.96,1,1.045][sequence%3];
