// Canvas artwork survives a run restart; the bound prevents an unbounded session cache.
const canvases=new Map<string,HTMLCanvasElement>();
export function cachedCanvas(key:string,make:()=>HTMLCanvasElement){
 const prior=canvases.get(key);if(prior){canvases.delete(key);canvases.set(key,prior);return prior;}
 const canvas=make();canvases.set(key,canvas);
 if(canvases.size>512)canvases.delete(canvases.keys().next().value!);
 return canvas;
}
export const decodedImages=new Map<string,HTMLImageElement>();

const sourceUrls=new WeakMap<HTMLImageElement,string>();
export function rememberImageSource(image:HTMLImageElement,url:string){sourceUrls.set(image,url);}
export function imageSourceUrl(image:HTMLImageElement){return sourceUrls.get(image)||image.src;}
