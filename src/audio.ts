export class AudioManager {
    context?: AudioContext;
    musicTimer?: number;
    last = 0;
    private gunnerAccentAt=-1000;
    sound = true;
    music = true;
    unlock() { this.context ??= new AudioContext(); void this.context.resume(); if (!this.musicTimer)
        this.musicTimer = window.setInterval(() => { if (this.music)
            this.tone(55, 1.4, .018, 'sine'); }, 1600); }
    tone(frequency: number, duration = .1, volume = .06, type: OscillatorType = 'triangle') { if (!this.context)
        return; const t = this.context.currentTime, o = this.context.createOscillator(), g = this.context.createGain(); o.type = type; o.frequency.setValueAtTime(frequency, t); o.frequency.exponentialRampToValueAtTime(Math.max(25, frequency * .45), t + duration); g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(.001, t + duration); o.connect(g); g.connect(this.context.destination); o.start(t); o.stop(t + duration); }
    play(kind: string) { if (!this.sound)
        return; const now = performance.now(); if (['hit', 'xp', 'death'].includes(kind) && now - this.last < 45)
        return;
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
