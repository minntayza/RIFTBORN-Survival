/** Keep the full-resolution source for previews; pre-filter gameplay textures in
 * small reductions, as Zawgyi does, to avoid aliasing when the GPU shrinks art. */
export function gameplayArtwork(source:HTMLCanvasElement,maxEdge=256){
 let result=source;
 while(Math.max(result.width,result.height)>maxEdge){
  const scale=Math.max(maxEdge/Math.max(result.width,result.height),.5);
  const next=document.createElement('canvas');
  next.width=Math.max(1,Math.round(result.width*scale));next.height=Math.max(1,Math.round(result.height*scale));
  const g=next.getContext('2d')!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(result,0,0,next.width,next.height);result=next;
 }
 return result;
}
