import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextMapView,validMapView} from '../src/map-view';
import {freshSave,validateSave} from '../src/save';
test('map toggle cycles through all three views',()=>{assert.equal(nextMapView(1),1.5);assert.equal(nextMapView(1.5),2);assert.equal(nextMapView(2),1);});
test('chosen intermediate view survives save validation and invalid values stay safe',()=>{const s=freshSave();s.settings.mapViewChosen=true;s.settings.mapView=1.5;assert.equal(validateSave(s).settings.mapView,1.5);for(const value of [null,0,3,NaN,'1.5'])assert.equal(validMapView(value),1);});
