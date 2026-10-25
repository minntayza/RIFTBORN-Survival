/** Hand-drawn medallion illustrations. Inline colors keep repeated HUD icons ID-safe. */
export function polishedGunnerIcon(kind:'beacon'|'breach'|'overdrive',theme:'jade'|'starlight'){
 const space=theme==='starlight',main=space?'#b69aff':'#50d9c7',shade=space?'#7761bd':'#208e89',light=space?'#f4edff':'#e0fff7',accent=space?'#77e8ff':'#ff807f',ink='#102632';
 const star=(x:number,y:number,r:number,color=accent)=>`<path d="M${x} ${y-r} ${x+r*.3} ${y-r*.3} ${x+r} ${y} ${x+r*.3} ${y+r*.3} ${x} ${y+r} ${x-r*.3} ${y+r*.3} ${x-r} ${y} ${x-r*.3} ${y-r*.3}Z" fill="${color}"/>`;
 const face=`<path d="M40 46v5m20-5v5" stroke="${accent}" stroke-width="4" stroke-linecap="round"/><circle cx="41" cy="46" r="1" fill="#fff"/><circle cx="61" cy="46" r="1" fill="#fff"/><path d="M46 56q4 4 8 0" fill="none" stroke="${light}" stroke-width="2" stroke-linecap="round"/>`;
 let art='';
 if(kind==='beacon')art=space?`
 <ellipse cx="50" cy="86" rx="23" ry="4" fill="#070e20" opacity=".6"/>
 <g stroke="${ink}" stroke-width="3" stroke-linejoin="round"><path d="m29 39-17-5-5 27 21 8Zm42 0 17-5 5 27-21 8Z" fill="${accent}"/><path d="m12 40 14 4-2 17-12-4Zm76 0-14 4 2 17 12-4Z" fill="#3489b2" stroke-width="1.5"/>
 <path d="M50 29V19" stroke="${accent}"/><path d="M33 29Q50 21 67 29L77 43 72 68Q50 88 28 68L23 43Z" fill="${shade}"/><path d="M34 29Q50 24 66 29L72 43 68 65Q50 77 32 65L28 43Z" fill="${main}" stroke-width="2"/>
 <rect x="31" y="38" width="38" height="25" rx="10" fill="#172940"/>
 <path d="M34 33q14-7 27-2" fill="none" stroke="${light}" stroke-width="3" stroke-linecap="round"/></g>${face}
 <path d="m50 6 4 8 9 2-7 6 1 9-7-4-8 4 2-9-7-6 9-2Z" fill="${light}" stroke="${ink}" stroke-width="2"/>
 ${star(50,72,6)}${star(83,20,4,light)}${star(16,76,3)}
 `:`
 <ellipse cx="50" cy="88" rx="27" ry="4" fill="#07181f" opacity=".6"/>
 <path d="M24 37q0-11 12-12h28q12 1 12 12v34q0 13-12 14H36Q24 84 24 72Z" fill="${shade}" stroke="${ink}" stroke-width="3"/>
 <path d="M29 35q1-7 9-7h24q9 0 10 8v34q0 9-9 10H38q-9 0-9-10Z" fill="${main}"/>
 <rect x="31" y="34" width="38" height="26" rx="9" fill="#153741" stroke="${ink}" stroke-width="2"/>${face}
 <circle cx="50" cy="70" r="10" fill="${accent}" stroke="${ink}" stroke-width="2.5"/><circle cx="50" cy="70" r="5" fill="#783f58"/><circle cx="48" cy="68" r="2" fill="#ffc8b7"/>
 <path d="m21 39-7 6 7 6m58-12 7 6-7 6M45 25l6-10h11" fill="none" stroke="${accent}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
 <path d="M36 29h22" stroke="${light}" stroke-width="2.5" stroke-linecap="round"/>${star(70,17,5)}${star(15,69,3,light)}
 `;
 else if(kind==='breach')art=space?`
 <ellipse cx="50" cy="89" rx="25" ry="4" fill="#0d1127" opacity=".6"/>
 <g stroke="${ink}" stroke-width="3" stroke-linejoin="round"><path d="m28 49-13 25 19-6m38-19 13 25-19-6" fill="${accent}"/>
 <path d="M40 25 50 12l10 13-2 8H42Z" fill="#57577d"/>
 <path d="M50 27c19 0 29 15 29 31S67 85 50 85 21 74 21 58s10-31 29-31Z" fill="${shade}"/>
 <path d="M50 29c16 0 25 13 25 28S64 79 49 79 24 70 24 56 34 29 50 29Z" fill="${main}" stroke-width="1.5"/>
 <circle cx="50" cy="55" r="19" fill="${light}" stroke="#7761bd" stroke-width="2"/>
 <path d="m50 38 5 10 12 2-9 8 2 12-10-6-11 6 3-12-9-8 12-2Z" fill="${accent}" stroke="#42688b" stroke-width="2"/></g>
 <path d="M31 41q6-8 15-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
 ${star(80,24,5,light)}${star(17,35,4)}<path d="M42 87h16" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
 `:`
 <ellipse cx="50" cy="89" rx="22" ry="4" fill="#0b1d28" opacity=".6"/>
 <path d="M32 34q0-6 7-7h22q8 1 8 7v41q0 10-10 11H41q-9-1-9-11Z" fill="${shade}" stroke="${ink}" stroke-width="3"/>
 <path d="M36 35q0-5 5-5h18q6 0 6 5v39q0 7-7 8H43q-7-1-7-8Z" fill="${main}"/>
 <rect x="35" y="26" width="31" height="10" rx="4" fill="${light}" stroke="${ink}" stroke-width="2.5"/>
 <path d="M45 26V17q0-4 5-4h8q4 0 4 4v9" fill="${accent}" stroke="${ink}" stroke-width="2.5"/>
 <circle cx="69" cy="24" r="11" fill="none" stroke="${ink}" stroke-width="6"/><circle cx="69" cy="24" r="11" fill="none" stroke="#e5f5f5" stroke-width="3"/>
 <rect x="38" y="45" width="25" height="27" rx="5" fill="#25414e"/>
 <path d="m52 43-14 18h11l-4 15 17-22H51Z" fill="${accent}" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>
 <path d="M37 40v15m4 22h16" stroke="${light}" stroke-width="2.5" stroke-linecap="round"/>
 ${star(19,34,4)}${star(79,74,4,light)}
 `;
 else{
 const gun=(mirror:boolean)=>`<g ${mirror?'transform="translate(100 0) scale(-1 1)"':''}><path d="m13 24 31 11 4 9-8 10-9-3-7 19-12-6 8-22-10-5Z" fill="${shade}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="m14 26 29 10 2 7-22-7-10-4Z" fill="${main}"/><path d="m15 31 24 8" stroke="${light}" stroke-width="2.5" stroke-linecap="round"/><path d="m24 48 7 2-6 13-7-3Z" fill="${accent}" stroke="${ink}" stroke-width="1.5"/>${space?`<ellipse cx="15" cy="30" rx="5" ry="7" transform="rotate(-65 15 30)" fill="${accent}" stroke="${ink}" stroke-width="2"/>`:`<path d="m34 34 10 3-2 9-10-3Z" fill="${accent}" stroke="${ink}" stroke-width="1.5"/>`}</g>`;
 art=`<path d="M20 72Q6 47 26 17m54 55q14-25-6-55" fill="none" stroke="${main}" stroke-width="4" stroke-linecap="round" opacity=".6"/>${gun(false)}${gun(true)}${space?`<path d="m50 45 7 13 15 3-11 11 2 16-13-7-14 7 3-16-12-11 16-3Z" fill="${accent}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="m49 52 3 13 11-1-11 7 2 11-8-12-11-6 12-1Z" fill="${light}"/>`:`<path d="m53 47-20 24h14l-5 18 24-28H52Z" fill="${accent}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="m48 60-7 8h12l-4 10" fill="none" stroke="#ffd6c2" stroke-width="2" stroke-linecap="round"/>`}${star(50,17,5,light)}${star(17,80,3)}${star(83,80,3)}`;
 }
 const burst=kind==='breach'?`<path d="M12 50 22 43 13 29 31 32 31 14 45 25 55 9 61 28 80 18 76 38 94 43 79 55 91 69 72 69 73 88 55 78 44 94 38 76 18 85 24 65 7 62Z" fill="${space?'#5475b2':'#b84f60'}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="m20 49 17-8-3-15 14 12 9-16 4 19 17-7-10 16 15 10-20 2 2 18-15-11-12 15-1-21-18 3 10-12Z" fill="${space?'#96ddf1':'#ffb379'}"/>`:'';
 return `<svg viewBox="0 0 100 100" aria-hidden="true" data-skill-icon="${kind}" data-icon-theme="${theme}"><circle cx="50" cy="50" r="49" fill="#0c1d2b"/><circle cx="50" cy="49" r="42" fill="${space?'#252b49':'#1b3b43'}"/><path d="M17 30Q36 9 65 17" fill="none" stroke="${space?'#49517b':'#32606a'}" stroke-width="2" stroke-linecap="round"/>${burst}${art}</svg>`;
}
