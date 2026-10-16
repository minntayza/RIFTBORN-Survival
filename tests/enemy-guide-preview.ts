import '../src/style.css';
import {zombieGuide,robotGuide} from '../src/enemy-guide';
document.querySelector('#guide')!.innerHTML=new URLSearchParams(location.search).has('robots')?robotGuide():zombieGuide();
