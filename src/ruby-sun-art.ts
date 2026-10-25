/** Crop the generated sprite without changing the staff's grip or end-to-end length. */
export const RUBY_SUN={key:'zawgyi-ruby-sun',url:'/assets/characters/zawgyi-ruby-sun-v1.png',crop:{x:330,y:20,width:365,height:1500},width:32.85,height:135};
export function rubySunTexture(image:HTMLImageElement){const c=document.createElement('canvas');c.width=146;c.height=600;const g=c.getContext('2d')!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';const r=RUBY_SUN.crop;g.drawImage(image,r.x,r.y,r.width,r.height,0,0,c.width,c.height);return c;}
