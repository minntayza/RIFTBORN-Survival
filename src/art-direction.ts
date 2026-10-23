import type Phaser from 'phaser';
import {rememberImageSource,imageSourceUrl} from './texture-cache';
const artwork = new Map<string, HTMLCanvasElement>();
/** Bake color and lighting once into canvas textures, never into the render loop. */
export function applyArtDirection(scene: Phaser.Scene) {
  for (const key of scene.textures.getTextureKeys()) {
    if (key.startsWith('__')) continue;
    const texture = scene.textures.get(key), source = texture.getSourceImage();
    if (!(source instanceof HTMLImageElement)) continue;
    const environment = ['city-asphalt','park-ground','city-wreck'].includes(key) || key.startsWith('robot-');
    const sourceUrl=imageSourceUrl(source),cacheKey=`${key}:${sourceUrl}`;
    let canvas = artwork.get(cacheKey);
    if (!canvas) {
      canvas = document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
      const ctx=canvas.getContext('2d')!;
      ctx.filter=environment?'saturate(1.15) contrast(1.12) brightness(.83)':'saturate(1.15) contrast(1.09)';
      ctx.drawImage(source,0,0);ctx.filter='none';
      if(environment){
        // Preserve outlines, texture and alpha while shifting concrete toward cool teal.
        const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
        for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const r=d[i],g=d[i+1],b=d[i+2];
          d[i]=r*.78;d[i+1]=g*.94+4;d[i+2]=b*.89+2;
        }ctx.putImageData(pixels,0,0);
      }
      if(key==='city-asphalt'){
        // Small hand-drawn moss tufts; repeatable and entirely decorative.
        let seed=73;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
        ctx.lineCap='round';
        for(let i=0;i<95;i++){const x=12+random()*(canvas.width-24),y=12+random()*(canvas.height-24),h=3+random()*6;
          ctx.strokeStyle=i%3?'#345847':'#48634b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x-5,y-h);ctx.moveTo(x,y);ctx.lineTo(x+1,y-h-2);ctx.moveTo(x+2,y);ctx.lineTo(x+5,y-h+1);ctx.stroke();
        }
      }
      rememberImageSource(canvas,sourceUrl);
      artwork.set(cacheKey,canvas);
      if(artwork.size>64)artwork.delete(artwork.keys().next().value!);
    }
    const frames=Object.values(texture.frames).filter(f=>f.name!=='__BASE').map(f=>({name:f.name,x:f.cutX,y:f.cutY,w:f.cutWidth,h:f.cutHeight}));
    scene.textures.remove(key);
    const replacement=scene.textures.addCanvas(key,canvas)!;
    for(const frame of frames)replacement.add(frame.name,0,frame.x,frame.y,frame.w,frame.h);
  }
}
