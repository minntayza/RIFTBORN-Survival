/** Keep a running arena sized to its actual host, including mobile browser-bar changes. */
export function observeGameViewport(host:HTMLElement,resize:(width:number,height:number)=>void){
 let frame=0,lastWidth=0,lastHeight=0;
 const measure=()=>{frame=0;const {width,height}=host.getBoundingClientRect(),w=Math.round(width),h=Math.round(height);if(w<1||h<1||w===lastWidth&&h===lastHeight)return;lastWidth=w;lastHeight=h;resize(w,h);};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
 const observer=new ResizeObserver(schedule);observer.observe(host);window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);schedule();
 return ()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);};
}
