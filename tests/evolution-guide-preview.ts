import '../src/style.css';
import {cardEvolutionGuide} from '../src/guide-ui';
import {freshSave} from '../src/save';
document.querySelector('main')!.innerHTML=cardEvolutionGuide(freshSave(),'zawgyi');
