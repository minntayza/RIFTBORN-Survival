type FullscreenRoot=HTMLElement&{webkitRequestFullscreen?:()=>Promise<void>|void};
type FullscreenDocument=Document&{webkitFullscreenElement?:Element|null;webkitExitFullscreen?:()=>Promise<void>|void};
export function isGameFullscreen(doc:Document=document){const d=doc as FullscreenDocument;return !!(d.fullscreenElement||d.webkitFullscreenElement);}
export function canGameFullscreen(doc:Document=document){const root=doc.documentElement as FullscreenRoot;return !!(root.requestFullscreen||root.webkitRequestFullscreen);}
/** Call directly from a click/key gesture, before asynchronous game loading. */
export async function enterGameFullscreen(doc:Document=document){
 if(isGameFullscreen(doc))return true;
 const root=doc.documentElement as FullscreenRoot,request=root.requestFullscreen||root.webkitRequestFullscreen;
 if(!request)return false;
 try{await request.call(root);if(typeof window!=='undefined'&&typeof screen!=='undefined'&&(matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0)){const orientation=screen.orientation as ScreenOrientation&{lock?:(orientation:string)=>Promise<void>};void orientation?.lock?.('landscape').catch(()=>{});}return isGameFullscreen(doc);}catch{return false;}
}
export async function toggleGameFullscreen(doc:Document=document){
 if(!isGameFullscreen(doc))return enterGameFullscreen(doc);
 const d=doc as FullscreenDocument,exit=d.exitFullscreen||d.webkitExitFullscreen;
 if(!exit)return false;
 try{await exit.call(d);return !isGameFullscreen(doc);}catch{return false;}
}
export function fullscreenButton(){return canGameFullscreen()?`<button type="button" class="quiet fullscreen-toggle" data-fullscreen aria-pressed="${isGameFullscreen()}" aria-label="${isGameFullscreen()?'Exit fullscreen':'Enter fullscreen'}">${isGameFullscreen()?'↙ Exit fullscreen':'⛶ Fullscreen'}</button>`:'';}
export function bindFullscreenControls(onUnavailable:()=>void){
 const sync=()=>{document.documentElement.classList.toggle('game-fullscreen',isGameFullscreen());document.querySelectorAll<HTMLButtonElement>('[data-fullscreen]').forEach(b=>{b.textContent=isGameFullscreen()?'↙ Exit fullscreen':'⛶ Fullscreen';b.setAttribute('aria-pressed',String(isGameFullscreen()));b.setAttribute('aria-label',isGameFullscreen()?'Exit fullscreen':'Enter fullscreen');});};
 const click=(e:MouseEvent)=>{if(!(e.target as Element).closest('[data-fullscreen]'))return;void toggleGameFullscreen().then(ok=>{sync();if(!ok)onUnavailable();});};
 document.addEventListener('click',click);document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);sync();
 return()=>{document.removeEventListener('click',click);document.removeEventListener('fullscreenchange',sync);document.removeEventListener('webkitfullscreenchange',sync);};
}
