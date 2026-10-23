import {startHomeScene} from '../src/home-scene';
for(const name of ['royal','forge','polar']){
 const card=document.createElement('article'),canvas=document.createElement('canvas');card.innerHTML=`<h2>${name}</h2>`;card.append(canvas);document.querySelector('main')!.append(card);
 await startHomeScene(canvas,'tank','hammer',false,undefined,`/assets/cosmetics/tank-v3/${name}.png`,`/assets/cosmetics/tank-${name}.png`);
 const status=document.createElement('p');status.textContent=canvas.dataset.ready==='true'?'Ready · Full equipped preview':'FAIL';card.append(status);
}
