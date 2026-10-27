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
