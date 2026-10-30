import {enterGameFullscreen} from './fullscreen';
export const shouldSuggestLandscape=(width:number,height:number,touch:boolean)=>touch&&width<height&&width<=700;
/** Suggest once at arrival; never rotate the rendered document or block portrait play. */
export function welcomeMobileLandscape(){
 const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 if(!shouldSuggestLandscape(innerWidth,innerHeight,touch))return;
 try{if(sessionStorage.getItem('rift-landscape-welcome'))return;sessionStorage.setItem('rift-landscape-welcome','1');}catch{}
 const dialog=document.createElement('dialog');dialog.className='landscape-welcome';dialog.setAttribute('aria-labelledby','landscape-welcome-title');
 dialog.innerHTML='<span class="rotate-phone-art" aria-hidden="true"></span><h2 id="landscape-welcome-title">A wider view. A better stand.</h2><p>Turn your phone sideways for more room to fight and comfortable skill controls.</p><button type="button" class="primary" data-landscape-start>Enter fullscreen</button><button type="button" class="quiet" data-landscape-continue>Keep playing upright</button>';
 document.body.append(dialog);
 const close=()=>{window.removeEventListener('resize',rotated);window.removeEventListener('orientationchange',rotated);dialog.close();dialog.remove();};
 const rotated=()=>{if(innerWidth>innerHeight)close();};
 dialog.querySelector('[data-landscape-start]')!.addEventListener('click',()=>{void enterGameFullscreen();close();});dialog.querySelector('[data-landscape-continue]')!.addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});window.addEventListener('resize',rotated);window.addEventListener('orientationchange',rotated);dialog.showModal();
}
