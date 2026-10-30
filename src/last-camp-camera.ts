/** Compact landscape screens frame the full courtyard at 1.5x, keeping gates readable. */
export function campCamera(width:number,height:number,view:number,x:number,y:number,campX:number,campY:number){
 const compactLandscape=width>height&&height<=600&&width<=1100;
 const fit=Math.max(width/1280,height/960);
 // The phone's wider aspect needs side breathing room rather than cropped entrance paths.
 const zoom=compactLandscape?Math.min(width/1280,height/960)*1.5/(view||1):Math.max(1.05,fit*2)/(view||1);
 const halfW=width/(2*zoom),halfH=height/(2*zoom);
 const left=campX-640,right=campX+640,top=campY-480,bottom=campY+480;
 return{zoom,x:halfW>=640?campX:Math.max(left+halfW,Math.min(right-halfW,(x+campX)/2)),y:halfH>=480?campY:Math.max(top+halfH,Math.min(bottom-halfH,(y+campY)/2-25))};
}
