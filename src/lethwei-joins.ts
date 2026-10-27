/** Remove only the baked-in thigh stubs below the shorts on the torso layer.
 * The moving legs supply that skin and tattoo artwork. Keep the garment hem. */
export function removeDuplicateThighs(data:Uint8ClampedArray,width:number,height:number){
 const start=Math.floor(height*.7),hem=Math.max(1,Math.round(height*.006));
 for(let x=0;x<width;x++){
  let lastCloth=-1;
  for(let y=start;y<height;y++){
   const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
   const red=r>80&&r>g*1.9&&r>b*2&&g<b*1.6+12;
   const gold=r>140&&g>90&&g>r*.7&&b<g*.55;
   if(data[i+3]>100&&(red||gold))lastCloth=y;
  }
  if(lastCloth<0)continue;
  for(let y=lastCloth+hem+1;y<height;y++)data[(y*width+x)*4+3]=0;
 }
}

/** Extend existing cloth across the wrist caps without changing the silhouette. */
export function wrapWristCap(data:Uint8ClampedArray,width:number,height:number,hand:boolean){
 const start=hand?0:Math.floor(height*.78),end=hand?Math.ceil(height*.25):height;
 for(let y=start;y<end;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
  if(!data[i+3]||r-g<20||g-b<15)continue;
  const period=Math.max(4,height*.045),fold=(y+x*.35)%period;
  const light=Math.max(170,Math.min(237,210+((r+g+b)/3-160)*.25-(fold<period*.2?23:0)));
  data[i]=light+7;data[i+1]=light+3;data[i+2]=light-7;
 }
}
