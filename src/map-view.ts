export type MapView=1|1.5|2;
export function nextMapView(view:number=1):MapView{return view===1?1.5:view===1.5?2:1;}
export function validMapView(view:unknown):MapView{return view===1.5||view===2?view:1;}

/** Daily practice has isolated run settings; update its camera and the saved preference together. */
export function cycleRunMapView(saved:{mapView:MapView;mapViewChosen?:boolean},run:{mapView:MapView;mapViewChosen?:boolean}=saved){
 const view=nextMapView(run.mapView);saved.mapView=run.mapView=view;saved.mapViewChosen=run.mapViewChosen=true;return view;
}
