/** Color and outline treatment is baked once; it never changes sprite geometry. */
export function colorfulCharacter(source:HTMLCanvasElement){
 const c=document.createElement('canvas');c.width=source.width;c.height=source.height;
 const g=c.getContext('2d')!;g.filter='saturate(1.18) brightness(1.08) contrast(1.03)';g.drawImage(source,0,0);return c;
}
export function outlinedWeapon(source:HTMLCanvasElement){
 const c=document.createElement('canvas');c.width=source.width;c.height=source.height;
 const silhouette=document.createElement('canvas');silhouette.width=c.width;silhouette.height=c.height;
 const mask=silhouette.getContext('2d')!;mask.drawImage(source,0,0);
 const pixels=mask.getImageData(0,0,c.width,c.height);
 for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]=10;pixels.data[i+1]=19;pixels.data[i+2]=30;pixels.data[i+3]=pixels.data[i+3]>100?255:0;}
 mask.putImageData(pixels,0,0);
 const g=c.getContext('2d')!,radius=Math.max(1,source.width/128*.8);
 for(let i=0;i<8;i++){const angle=i*Math.PI/4;g.drawImage(silhouette,Math.cos(angle)*radius,Math.sin(angle)*radius);}
 g.filter='saturate(1.15) brightness(1.08)';g.drawImage(source,0,0);return c;
}
