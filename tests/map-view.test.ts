import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextMapView,validMapView,cycleRunMapView} from '../src/map-view';
import {freshSave,validateSave} from '../src/save';
test('map toggle cycles through all three views',()=>{assert.equal(nextMapView(1),1.5);assert.equal(nextMapView(1.5),2);assert.equal(nextMapView(2),1);});
test('chosen intermediate view survives save validation and invalid values stay safe',()=>{const s=freshSave();s.settings.mapViewChosen=true;s.settings.mapView=1.5;assert.equal(validateSave(s).settings.mapView,1.5);for(const value of [null,0,3,NaN,'1.5'])assert.equal(validMapView(value),1);});

test('daily practice view changes reach its isolated camera settings',async()=>{
 const {prepareRunSave}=await import('../src/daily-appearance');const {dailySetup}=await import('../src/retention');
 const s=freshSave();s.settings.mapView=1;const run=prepareRunSave(s,{...dailySetup('2026-10-30'),practice:true});assert.notEqual(run.settings,s.settings);
 for(const expected of [1.5,2,1]){cycleRunMapView(s.settings,run.settings);assert.equal(run.settings.mapView,expected);assert.equal(s.settings.mapView,expected);}
});

test('desktop Endless defaults to 1x with Daily at 1.5x and preserves explicit player choices',async()=>{
 const {defaultMapView}=await import('../src/save');const {prepareRunSave}=await import('../src/daily-appearance');const {dailySetup}=await import('../src/retention');
 assert.equal(defaultMapView('endless'),1);assert.equal(defaultMapView('daily'),1.5);
 const s=freshSave();assert.equal(s.settings.mapView,1);
 const daily=prepareRunSave(s,dailySetup('2026-10-30'));assert.equal(daily.settings.mapView,1.5);assert.equal(s.settings.mapView,1);
 s.settings.mapViewChosen=true;s.settings.mapView=1.5;assert.equal(validateSave(s).settings.mapView,1.5);assert.equal(prepareRunSave(s,dailySetup('2026-10-30')).settings.mapView,1.5);
});
