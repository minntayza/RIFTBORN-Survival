import './music-preview.css';
const track = new Audio('/audio/riftborn-last-light-v1.mp3');
track.loop = true;
track.preload = 'none';
track.volume = 0.14;
let enabled = true;
try { enabled = localStorage.getItem('zls-music-enabled') !== 'false'; } catch { /* Use the default when storage is unavailable. */ }
const toggle = document.createElement('button');
toggle.className = 'music-toggle';
toggle.type = 'button';
function render() {
  toggle.setAttribute('aria-label', enabled ? 'Turn music off' : 'Turn music on');
  toggle.setAttribute('aria-pressed', String(enabled));
  toggle.title = enabled ? 'Turn music off' : 'Turn music on';
  toggle.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>${enabled ? '' : '<path d="M3 3l18 18"/>'}</svg>`;
}
export function setMusicEnabled(value: boolean) {
  enabled = value;
  try { localStorage.setItem('zls-music-enabled', String(enabled)); } catch { /* Keep the choice for this session. */ }
  render();
  if (!enabled || document.hidden) track.pause();
  else void track.play().catch(() => { /* Retry after a user gesture if autoplay is blocked. */ });
}
toggle.addEventListener('click', () => setMusicEnabled(!enabled));
for (const event of ['pointerdown', 'keydown']) document.addEventListener(event, e => {
  if (e.target instanceof Node && toggle.contains(e.target)) return;
  if (enabled && track.paused && !document.hidden) void track.play().catch(() => {});
}, { capture: true });
track.addEventListener('error', () => { enabled = false; render(); toggle.title = 'Music unavailable. Reload to retry.'; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) track.pause();
  else if (enabled) setMusicEnabled(true);
});
render();
document.body.append(toggle);
if (enabled) void track.play().catch(() => {});

let musicScene='menu',musicFade=0;
/** Use the original Last Light score and mute choice; only blend its level between scenes. */
export function setMusicScene(scene:'menu'|'camp'|'siege'){
 if(scene===musicScene)return;musicScene=scene;cancelAnimationFrame(musicFade);
 const start=track.volume,target=scene==='camp'?.10:scene==='siege'?.13:.14,born=performance.now();
 const blend=(now:number)=>{const t=Math.min(1,(now-born)/600);track.volume=start+(target-start)*t;if(t<1)musicFade=requestAnimationFrame(blend);};
 musicFade=requestAnimationFrame(blend);
}
