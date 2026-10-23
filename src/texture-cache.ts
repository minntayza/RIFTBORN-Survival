// Canvas artwork survives a run restart; the bound prevents an unbounded session cache.
const canvases=new Map<string,HTMLCanvasElement>();
let canvasBytes=0;
const MAX_CANVAS_BYTES=64*1024*1024;
export function cachedCanvas(key:string,make:()=>HTMLCanvasElement){
 const prior=canvases.get(key);if(prior){canvases.delete(key);canvases.set(key,prior);return prior;}
 const canvas=make();canvases.set(key,canvas);canvasBytes+=canvas.width*canvas.height*4;
 while(canvases.size>1&&(canvases.size>512||canvasBytes>MAX_CANVAS_BYTES)){const oldest=canvases.keys().next().value!,value=canvases.get(oldest)!;canvasBytes-=value.width*value.height*4;canvases.delete(oldest);}
 return canvas;
}
export const decodedImages=new Map<string,HTMLImageElement>();

const sourceUrls=new WeakMap<HTMLImageElement|HTMLCanvasElement,string>();
export function rememberImageSource(image:HTMLImageElement|HTMLCanvasElement,url:string){sourceUrls.set(image,url);}
export function imageSourceUrl(image:HTMLImageElement|HTMLCanvasElement){return sourceUrls.get(image)||('src' in image?image.src:'');}
