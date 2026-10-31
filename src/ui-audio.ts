/** Short original D-minor fantasy motifs matching the Last Light soundtrack. */
export type UiNote={at:number;hz:number;duration:number;gain:number;wave?:OscillatorType};
const note=(at:number,hz:number,duration=.12,gain=.024,wave:OscillatorType='sine'):UiNote=>({at,hz,duration,gain,wave});
export const UI_SOUND_CUES:Record<string,readonly UiNote[]>={
 'card-reveal':[note(0,587,.18,.018),note(.10,880,.08,.012),note(.18,1047,.08,.012),note(.26,1175,.12,.014)],
 'card-pick':[note(0,294,.08,.028,'triangle'),note(.035,880,.15,.022),note(.07,1175,.16,.014)],
 'card-reroll':[note(0,440,.06,.015,'triangle'),note(.055,349,.06,.015,'triangle'),note(.11,587,.10,.019)],
 'evolution-reveal':[note(0,147,.3,.025,'triangle'),note(.08,587,.22,.018),note(.18,880,.24,.016),note(.30,1397,.3,.013)],
 'evolution-pick':[note(0,147,.26,.03,'triangle'),note(.06,294,.22,.02),note(.13,698,.23,.022),note(.22,880,.3,.02),note(.31,1175,.34,.018)],
 'gift-open':[note(0,220,.07,.022,'triangle'),note(.07,698,.12,.021),note(.16,1047,.20,.018)],
 'reward-unlock':[note(0,587,.15,.025),note(.12,698,.15,.023),note(.24,880,.2,.022),note(.38,1175,.32,.023),note(.38,587,.34,.012)],
 'clear':[note(0,294,.19,.02,'triangle'),note(.12,587,.17,.023),note(.24,880,.2,.02),note(.37,1175,.26,.019)],
 'skill-ready':[note(0,880,.065,.009),note(.065,1175,.10,.007)],
 'camp-hit':[note(0,95,.12,.028,'triangle'),note(.025,190,.075,.014)],
 'camp-warning':[note(0,294,.14,.022,'triangle'),note(.21,262,.18,.022,'triangle')],
};
export const cueCooldown=(kind:string)=>kind==='camp-warning'?5000:kind==='camp-hit'?350:kind==='skill-ready'?650:120;
