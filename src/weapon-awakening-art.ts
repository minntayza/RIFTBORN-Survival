export type WeaponElement='reach'|'power'|'tempo';
export const ELEMENT_COLORS={reach:[90,204,255],power:[255,143,53],tempo:[174,128,245]} as const;
export function metalPixel(r:number,g:number,b:number,a:number){return a>180&&Math.max(r,g,b)>55&&(Math.max(r,g,b)-Math.min(r,g,b)<58||b>r*1.1&&g>r*1.05);}
/** One-time texture treatment; keep the original grip, outline and proportions. */
export function awakenWeaponCanvas(source:CanvasImageSource,width:number,height:number,element:WeaponElement,full:boolean){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const g=canvas.getContext('2d',{willReadFrequently:true})!;g.drawImage(source,0,0,width,height);
 const image=g.getImageData(0,0,width,height),d=image.data,color=ELEMENT_COLORS[element],points:{u:number;v:number}[]=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;if(!metalPixel(d[i],d[i+1],d[i+2],d[i+3]))continue;
  // Broad metal bevels and sparse luminous seams stay legible at arena scale.
  const seam=(x+Math.floor(y/7)*3)%19<2,mix=seam?(full?.8:.6):(full?.42:.28);
  for(let c=0;c<3;c++)d[i+c]=Math.round(d[i+c]*(1-mix)+color[c]*mix);
  if(x%5===0&&y%5===0)points.push({u:x/width,v:y/height});
 }
 g.putImageData(image,0,0);
 return {canvas,points};
}
