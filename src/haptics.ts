/** Short contact feedback, independent of sound; unsupported browsers simply do nothing. */
export class CombatHaptics {
 enabled=true;
 private last=-Infinity;
 pulse(kind:string,now=performance.now()){
  const duration=kind==='critical'||kind==='tank-slam'?24:kind==='hurt'?30:kind==='hit'||kind==='staff-contact'||kind==='tank-bonk'||kind==='keen-hit'?10:0;
  if(!this.enabled||!duration||now-this.last<120||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return false;
  if(typeof document!=='undefined'&&document.hidden)return false;
  try{const accepted=navigator.vibrate(duration);if(accepted)this.last=now;return accepted;}catch{return false;}
 }
}
