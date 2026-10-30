"""Compose RIFTBORN's original 40-second instrumental loop; no sampled recordings.
Requires numpy and ffmpeg. Run from the repository root.
"""
from pathlib import Path
import subprocess, tempfile, wave
import numpy as np
SR=32000
BEAT=60/96
LENGTH=64*BEAT
N=round(SR*LENGTH)
rng=np.random.default_rng(731)
mix=np.zeros((N,2),dtype=np.float64)
def hz(m):return 440*2**((m-69)/12)
def add(start,sound,pan=0):
    idx=(round(start*SR)+np.arange(len(sound)))%N
    np.add.at(mix[:,0],idx,sound*np.sqrt((1-pan)/2))
    np.add.at(mix[:,1],idx,sound*np.sqrt((1+pan)/2))
def instrument(note,duration,kind):
    t=np.arange(round(duration*SR))/SR;f=hz(note)
    if kind=='flute':
        signal=np.sin(2*np.pi*f*t+.018*np.sin(2*np.pi*4.8*t))+.16*np.sin(2*np.pi*f*2*t)
        env=np.minimum(t/.07,1)*np.minimum((duration-t)/.14,1)*.10
    elif kind=='pluck':
        signal=np.sin(2*np.pi*f*t)+.33*np.sin(2*np.pi*f*2.01*t)+.1*np.sin(2*np.pi*f*3.98*t)
        env=(1-np.exp(-t*220))*np.exp(-t*7)*.10
    elif kind=='bass':
        signal=np.sin(2*np.pi*f*t)+.1*np.sin(2*np.pi*f*2*t)
        env=np.minimum(t/.03,1)*np.exp(-t*2)*np.minimum((duration-t)/.08,1)*.13
    else:
        signal=np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*2*t)
        env=np.minimum(t/.45,1)*np.minimum((duration-t)/.55,1)*.028
    return signal*np.clip(env,0,None)
# D minor / B-flat / F / C: warm, adventurous rather than ominous.
chords=[(50,[62,65,69]),(46,[62,65,70]),(41,[60,65,69]),(48,[60,64,67])]
melody=[[(0,74,1.5),(2,77,.8),(3,81,.65)],[(.5,79,1),(2,77,1.5)],[(0,76,1),(1.5,77,.8),(3,74,.8)],[(0,72,1.5),(2.5,69,1)],[(0,74,1),(1.5,77,1),(3,79,.8)],[(0,81,1.8),(2.5,77,1)],[(.5,76,1),(2,74,1)],[(0,72,1.5),(2,69,1.5)]]
for bar in range(16):
    base=bar*4*BEAT;root,notes=chords[bar%4]
    for j,note in enumerate(notes):add(base,instrument(note,4*BEAT+.4,'pad'),(j-1)*.45)
    for beat in (0,2):add(base+beat*BEAT,instrument(root,1.1,'bass'),0)
    for step in range(8):
        note=notes[[0,1,2,1,0,2,1,2][step]]+(12 if step in (3,7) else 0)
        sig=instrument(note,.65,'pluck');start=base+step*.5*BEAT
        add(start,sig,.4 if step%2 else -.4);add(start+.75*BEAT,sig*.18,-.4 if step%2 else .4)
    for beat,note,dur in melody[bar%8]:
        sig=instrument(note,dur*BEAT,'flute');add(base+beat*BEAT,sig,-.08);add(base+(beat+.75)*BEAT,sig*.17,.35)
    # Soft frame-drum pulse and brushed offbeats; no harsh cymbals.
    for beat in range(4):
        t=np.arange(round(.16*SR))/SR
        drum=np.sin(2*np.pi*(72*t-18*t*t))*np.exp(-t*28)*(.065 if beat%2==0 else .035)
        add(base+beat*BEAT,drum)
        brush=rng.normal(0,1,len(t));brush=np.convolve(brush,np.ones(12)/12,'same')*np.exp(-t*44)*.018
        add(base+(beat+.5)*BEAT,brush,.35)
mix=np.tanh(mix*1.7);mix*=.86/max(np.max(np.abs(mix)),.001)
out=Path('public/audio/riftborn-last-light-v1.mp3');out.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as folder:
    wav=Path(folder)/'score.wav'
    with wave.open(str(wav),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k',str(out)],check=True)
print(f'{out}: {LENGTH:.0f}s, 96 BPM, stereo, original synthesized score')
