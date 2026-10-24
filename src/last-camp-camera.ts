/** Fit the finite courtyard without stretching its art or exposing outside space. */
export function campCamera(width:number,height:number,view:number,x:number,y:number,campX:number,campY:number){
 const zoom=Math.max(1.05/(view||1),width/1280,height/960);
 const halfW=width/(2*zoom),halfH=height/(2*zoom);
 const left=campX-640,right=campX+640,top=campY-480,bottom=campY+480;
 return{zoom,x:Math.max(left+halfW,Math.min(right-halfW,(x+campX)/2)),y:Math.max(top+halfH,Math.min(bottom-halfH,(y+campY)/2-25))};
}
