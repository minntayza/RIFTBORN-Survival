export {};
const canvas=document.querySelector<HTMLCanvasElement>('#portrait')!,g=canvas.getContext('2d')!;
const backdrop=document.querySelector<HTMLSelectElement>('#backdrop')!,zoom=document.querySelector<HTMLInputElement>('#zoom')!;
const art=new Image();let mirrored=false;
function draw(){
 const {width:w,height:h}=canvas;g.clearRect(0,0,w,h);
 if(backdrop.value==='checker'){for(let y=0;y<h;y+=40)for(let x=0;x<w;x+=40){g.fillStyle=((x+y)/40)%2?'#bfc6c5':'#dce1de';g.fillRect(x,y,40,40);}}
 else{const gradient=g.createRadialGradient(w*.5,h*.4,20,w*.5,h*.5,h*.7);gradient.addColorStop(0,backdrop.value==='parchment'?'#f1e4ca':'#2b4c53');gradient.addColorStop(1,backdrop.value==='parchment'?'#c7b79a':'#102329');g.fillStyle=gradient;g.fillRect(0,0,w,h);}
 if(!art.complete||!art.naturalWidth)return;
 const scale=Math.min((w-120)/art.width,(h-100)/art.height)*Number(zoom.value)/100,aw=art.width*scale,ah=art.height*scale;
 g.save();g.translate(w/2,h/2);if(mirrored)g.scale(-1,1);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(art,-aw/2,-ah/2,aw,ah);g.restore();
}
art.onload=()=>{draw();document.querySelector('#status')!.textContent='Full-body canvas ready';};art.onerror=()=>{document.querySelector('#status')!.textContent='Artwork could not load';};art.src='/assets/characters/kyansittha-royal-concept-v1.png';
backdrop.addEventListener('change',draw);zoom.addEventListener('input',draw);document.querySelector('#flip')!.addEventListener('click',()=>{mirrored=!mirrored;draw();});draw();
