export type MapView=1|1.5|2;
export function nextMapView(view:number=1):MapView{return view===1?1.5:view===1.5?2:1;}
export function validMapView(view:unknown):MapView{return view===1.5||view===2?view:1;}
