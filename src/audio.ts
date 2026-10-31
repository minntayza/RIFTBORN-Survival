import {UI_SOUND_CUES,cueCooldown} from './ui-audio';
import {combatVoice,voicePitch,type AttackVoice} from './combat-audio';
import {CombatHaptics} from './haptics';
export class AudioManager {
    context?: AudioContext;
    readonly haptics=new CombatHaptics();
    character='ninja';
    element='';
    private voices=0;
    private variation=0;
    private voiceAt=new Map<string,number>();
    private noise?:AudioBuffer;
    private noiseContext?:AudioContext;
    private accentAt=-1000;
    private cueAt=new Map<string,number>();
    private cueTimers=new Set<ReturnType<typeof setTimeout>>();
    private cueGeneration=0;
    musicTimer?: number;
    last = 0;
    private gunnerAccentAt=-1000;
    sound = true;
    music = true;
    unlock() {
        try {
            const session=(navigator as Navigator&{audioSession?:{type:string}}).audioSession;
            if(session)session.type='playback';
        }catch{/* Optional session routing is unavailable in some browsers. */}
        try{
            const ctor=globalThis.AudioContext||(globalThis as typeof globalThis&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
            if(!ctor)return;
            if(!this.context||this.context.state==='closed')this.context=new ctor();
            if(this.context.state!=='running')void this.context.resume().catch(()=>{});
        }catch{return;}
 if (!this.musicTimer)
        this.musicTimer = window.setInterval(() => { if (this.music)
            this.tone(55, 1.4, .018, 'sine'); }, 1600); }
    tone(frequency: number, duration = .1, volume = .06, type: OscillatorType = 'triangle') { if (!this.context)
        return; const t = this.context.currentTime, o = this.context.createOscillator(), g = this.context.createGain(); o.type = type; o.frequency.setValueAtTime(frequency, t); o.frequency.exponentialRampToValueAtTime(Math.max(25, frequency * .45), t + duration); g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(.001, t + duration); o.connect(g); g.connect(this.context.destination); o.start(t); o.stop(t + duration); o.onended=()=>{o.disconnect();g.disconnect();}; }
    private physical(voice:AttackVoice,kind:string){
        const c=this.context;if(!c||c.state!=='running'||this.voices>=12)return;
        const now=performance.now(),bucket=['hit','critical','keen-hit','staff-contact','tank-bonk','tank-thump'].includes(kind)?'contact':kind;
        if(now-(this.voiceAt.get(bucket)??-1000)<(bucket==='contact'?55:35))return;
        this.voiceAt.set(bucket,now);
        const pitch=voicePitch(this.variation++),critical=kind==='critical',duration=voice.duration*(critical?1.2:1),t=c.currentTime;
        if(!this.noise||this.noiseContext!==c){this.noise=c.createBuffer(1,c.sampleRate,c.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseContext=c;}
        const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
        src.buffer=this.noise;filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(voice.air*pitch,t);filter.frequency.exponentialRampToValueAtTime(Math.max(160,voice.air*.35),t+duration);
        gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(voice.gain*(critical?1.15:1),t+.004);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
        src.connect(filter);filter.connect(gain);gain.connect(c.destination);this.voices++;
        src.onended=()=>{this.voices--;src.disconnect();filter.disconnect();gain.disconnect();};src.start(t,(this.variation%3)*.2,duration);src.stop(t+duration);
        this.tone(voice.body*pitch,duration,voice.gain*.55,'sine');
        if(voice.ring)this.tone(voice.ring*pitch,Math.min(.14,duration*1.3),voice.gain*.16,'sine');
        if(this.element&&now-this.accentAt>180){this.accentAt=now;if(this.element==='reach')this.tone(1750,.045,.009,'triangle');else if(this.element==='power')this.tone(85,.1,.012,'triangle');else this.tone(650,.18,.008,'sine');}
    }
    private uiCue(kind:string){
        const notes=UI_SOUND_CUES[kind];if(!notes)return false;
        const now=performance.now();if(now-(this.cueAt.get(kind)??-Infinity)<cueCooldown(kind))return true;
        this.cueAt.set(kind,now);
        const foreground=!['camp-hit','camp-warning','skill-ready'].includes(kind);
        if(foreground){this.cueGeneration++;for(const timer of this.cueTimers)clearTimeout(timer);this.cueTimers.clear();}
        const generation=this.cueGeneration;
        for(const note of notes){
            const sound=()=>{if(this.sound&&(typeof document==='undefined'||!document.hidden)&&(!foreground||generation===this.cueGeneration))this.tone(note.hz,note.duration,note.gain,note.wave);};
            if(note.at===0)sound();else{const timer=setTimeout(()=>{this.cueTimers.delete(timer);sound();},note.at*1000);this.cueTimers.add(timer);}
        }
        return true;
    }
    play(kind: string) { this.haptics.pulse(kind);if (!this.sound)
        return; if(this.uiCue(kind))return; const now = performance.now(); if (['hit', 'xp', 'death'].includes(kind) && now - this.last < 45)
        return;
        const voice=combatVoice(kind,this.character);if(voice){this.physical(voice,kind);return;}
        if(kind==='bow-release'){this.tone(460,.045,.055,'triangle');this.tone(1050,.075,.018,'sine');return;}
        if(kind==='hempwraps'){this.tone(145,.055,.05,'triangle');this.tone(380,.04,.018,'sine');return;}
        if(kind==='camp-horn'){this.tone(146,.8,.025,'triangle');this.tone(220,.9,.012,'sine');return;}
        if(kind==='staff-contact'){this.tone(180,.055,.025,'triangle');this.tone(390,.07,.009,'sine');return;}
        if(kind==='tank-bonk'){this.tone(360,.08,.023,'triangle');return;}
        if(kind==='tank-thump'){this.tone(95,.19,.03,'triangle');return;}
        if(kind==='tank-block'){this.tone(610,.12,.02,'sine');return;}
        if(kind==='tank-return'){this.tone(940,.14,.022,'sine');return;}
        if(kind==='tank-slam'){this.tone(100,.25,.03,'triangle');this.tone(600,.2,.013,'sine');return;}
        if(kind==='overdrive'){this.tone(660,.23,.028,'triangle');this.tone(990,.3,.014,'sine');return;}
        if(kind==='reload-swish'){this.tone(260,.13,.018,'sine');return;}
        if(kind==='reload-pop'){this.tone(820,.09,.025,'triangle');this.tone(1230,.12,.01,'sine');return;}
        if(kind==='ricochet-chime'||kind==='verdict-pop'){
            if(now-this.gunnerAccentAt<90)return;this.gunnerAccentAt=now;
            if(kind==='ricochet-chime')this.tone(980,.09,.019,'sine');
            else{this.tone(110,.2,.03,'triangle');this.tone(660,.15,.012,'sine');}return;
        }
        if(kind==='lotus-guard'){this.tone(520,.26,.023,'sine');this.tone(780,.3,.01,'triangle');return;}
        if(kind==='lotus-counter'){this.tone(1040,.24,.03,'triangle');this.tone(1560,.32,.014,'sine');return;}
        if(kind==='dragon-slash'){this.tone(160,.26,.032,'triangle');this.tone(640,.2,.019,'sine');return;}
        if(kind==='storm-blade'){if(now-this.last<80)return;this.last=now;this.tone(420,.15,.018,'sine');return;}
        if(kind==='smoke-bloom'){this.tone(180,.22,.03,'sine');this.tone(720,.16,.013,'triangle');return;}
        if(kind==='moon-dash'){this.tone(880,.24,.03,'sine');this.tone(1320,.32,.017,'triangle');return;}
        if(kind==='echo-slash'){this.tone(660,.13,.025,'triangle');return;}
        if(kind==='crescent-cut'){this.tone(280,.14,.022,'sine');return;}
        if(kind==='keen-hit'){if(now-this.last<45)return;this.last=now;this.tone(780,.055,.028,'triangle');return;}
        this.last = now; const f: Record<string, number> = { katana:330,dual:410,nodachi:130,cursed:165,pistols:290,shotgun:95,shield:140,spiked:190,kama:310,naginata:180,smg:260,hammer:65,overdrive:540,slam:80,attack: 230, hit: 150, critical: 490, death: 95, hurt: 70, xp: 690, gold: 900, level: 1100, ability: 350, wave: 420, clear: 700, elite: 55, boss: 35, buy: 1000, over: 60 }; this.tone(f[kind] || 220, ['boss','over','level','hammer','slam'].includes(kind) ? .45 : .09, .045, kind==='smg'?'square':kind === 'hurt' ? 'sawtooth' : 'triangle'); }
}
