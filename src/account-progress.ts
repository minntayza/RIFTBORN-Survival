import {freshSave,packProgress,unpackProgress,validateSave,validProgress,type Progress} from './save';
export type AccountUser={id:string;name:string;email?:string};
export type CloudProgress={progress:Progress;revision:number};
export interface ProgressRemote{read(userId:string):Promise<CloudProgress|null>;write(userId:string,progress:Progress,revision:number|null):Promise<CloudProgress>}
export class ProgressConflict extends Error{}
export type AccountPhase='guest'|'loading'|'saved'|'saving'|'offline'|'conflict'|'waiting';
export type AccountState={user:AccountUser|null;phase:AccountPhase;message:string;conflict?:{local:Progress;cloud:CloudProgress}};
const PREFIX='zls.account.';
export function progressSignature(progress:Progress){return JSON.stringify({save:validateSave(progress.save),run:progress.run});}
export function emptyProgress():Progress{return{version:2 as const,updatedAt:Date.now(),save:{...freshSave(),accountCurrencyVersion:1},run:null};}
// Remove the historical guest reserve once, retaining rewards earned above it.
export function accountCurrency(progress:Progress):Progress {
 if(progress.save.accountCurrencyVersion===1)return progress;
 const gold=progress.save.gold>=1_000_000_000?progress.save.gold-1_000_000_000:progress.save.gold;
 return {...progress,save:{...progress.save,gold,accountCurrencyVersion:1}};
}
export function freshProgress(p:Progress){return !p.run&&progressSignature({...p,save:{...p.save,settings:freshSave().settings}})===progressSignature(emptyProgress());}
export function checkedCloud(raw:unknown):CloudProgress{
 const r=raw as {progress?:unknown;revision?:unknown};if(!validProgress(r?.progress)||typeof r.revision!=='number'||!Number.isSafeInteger(r.revision)||r.revision<1)throw Error('Cloud progress could not be read. Your device save is safe.');
 return {progress:{...r.progress,save:validateSave(r.progress.save)},revision:r.revision};
}
/** Coordinates account boundaries and optimistic cloud writes. Auth lives outside. */
export class AccountProgress {
 state:AccountState={user:null,phase:'guest',message:'Progress saved on this device'};
 private revision:number|null=null;private epoch=0;private timer:ReturnType<typeof setTimeout>|undefined;private busy=false;private pending:AccountUser|null|undefined;private memory=new Map<string,string|null>();
 constructor(private remote:ProgressRemote,private storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,private read:()=>Progress,private apply:(p:Progress,account:boolean)=>void,private safe:()=>boolean,private changed:()=>void){}
 private get(key:string){if(this.memory.has(key))return this.memory.get(key)??null;try{return this.storage.getItem(PREFIX+key);}catch{return null;}}
 private put(key:string,value:string|null){this.memory.set(key,value);try{if(value===null)this.storage.removeItem(PREFIX+key);else this.storage.setItem(PREFIX+key,value);}catch{/* Local gameplay storage reports its own errors. */}}
 private update(phase:AccountPhase,message:string,conflict?:AccountState['conflict']){this.state={...this.state,phase,message,conflict};this.changed();}
 private cache(id:string,p:Progress){this.put('cache.'+id,packProgress(p));}
 private bind(user:AccountUser,p:Progress){if(p.save.accountCurrencyVersion!==1)this.put('backup.currency.'+user.id,packProgress(p));p=accountCurrency(p);this.put('owner',user.id);this.apply(p,true);this.cache(user.id,p);}
 async connect(user:AccountUser|null){
  if(this.timer)clearTimeout(this.timer);this.timer=undefined;const generation=++this.epoch;
  if(!this.safe()){this.pending=user;this.state={user,phase:'waiting',message:'Return to camp to finish account sync'};this.changed();return;}
  this.pending=undefined;const owner=this.get('owner'),current=this.read();if(owner)this.cache(owner,current);
  this.state={user,phase:user?'loading':'guest',message:user?'Checking cloud progress…':'Progress saved on this device'};this.changed();
  if(!user){const guest=owner?unpackProgress(this.get('guest'))||emptyProgress():current;this.put('owner',null);this.apply(guest,false);return;}
  if(!owner)this.put('guest',packProgress(current));
  const local=accountCurrency(owner===user.id?current:unpackProgress(this.get('cache.'+user.id))||emptyProgress());
  this.revision=null;
  // Bind only account-owned progress, even when the initial cloud read fails.
  this.bind(user,local);
  try{
   const cloud=await this.remote.read(user.id);if(generation!==this.epoch)return;
   const migrateCloud=!!cloud&&cloud.progress.save.accountCurrencyVersion!==1;
   if(cloud){if(migrateCloud)this.put('backup.currency.cloud.'+user.id,packProgress(cloud.progress));cloud.progress=accountCurrency(cloud.progress);}
   this.revision=cloud?.revision??null;
   if(!this.safe()){this.pending=user;this.update('waiting','Return to camp to finish account sync');return;}
   if(!cloud){this.bind(user,local);this.update('saved','Saving your progress…');await this.flush();}
   else if(progressSignature(local)===progressSignature(cloud.progress)||freshProgress(local)){this.bind(user,cloud.progress);this.update('saved','Progress saved ✓');}
   else this.update('conflict','Choose which progress to keep',{local,cloud});
  }catch{if(generation===this.epoch)this.update('offline','Cloud sync unavailable. Your device progress is safe.');}
 }
 async resume(){if(this.pending!==undefined&&this.safe()){const user=this.pending;this.pending=undefined;await this.connect(user);}}
 dirty(){if(this.state.user&&this.get('owner')===this.state.user.id)this.cache(this.state.user.id,this.read());if(this.state.phase!=='saved'&&this.state.phase!=='saving')return;if(this.state.phase==='saved')this.update('saving','Saving progress…');if(!this.timer)this.timer=setTimeout(()=>{this.timer=undefined;void this.flush();},5000);}
 async choose(choice:'local'|'cloud'){
  const {user,conflict}=this.state;if(!user||!conflict||!this.safe())return;
  this.put('backup.local.'+user.id,packProgress(conflict.local));this.put('backup.cloud.'+user.id,packProgress(conflict.cloud.progress));
  this.revision=conflict.cloud.revision;
  this.bind(user,choice==='cloud'?conflict.cloud.progress:conflict.local);this.update('saved',choice==='cloud'?'Cloud progress restored ✓':'Saving device progress…');
  if(choice==='local')await this.flush();
 }
 async flush(){
  const user=this.state.user;if(!user||this.busy||this.get('owner')!==user.id||!['saved','saving','offline'].includes(this.state.phase)||this.state.conflict)return;
  // A failed initial read must never turn into an unconditional overwrite.
  if(this.state.phase==='offline'&&this.revision===null){await this.connect(user);return;}
  const generation=this.epoch,snapshot=this.read();this.busy=true;this.update('saving','Saving progress…');
  try{
   const record=await this.remote.write(user.id,snapshot,this.revision);if(generation!==this.epoch)return;
   this.revision=record.revision;this.cache(user.id,snapshot);this.update('saved','Progress saved ✓');
   if(progressSignature(snapshot)!==progressSignature(this.read()))this.dirty();
  }catch(error){if(generation!==this.epoch)return;if(error instanceof ProgressConflict){try{const cloud=await this.remote.read(user.id);if(generation!==this.epoch)return;if(!cloud)throw Error();cloud.progress=accountCurrency(cloud.progress);this.update('conflict','Another device has newer progress. Choose which to keep.',{local:this.read(),cloud});}catch{this.update('offline','Cloud sync unavailable. Your device progress is safe.');}}else this.update('offline','Not synced yet. Progress is saved on this device.');}
  finally{this.busy=false;if(generation!==this.epoch&&this.state.phase==='saved')this.dirty();}
 }
 async retry(){if(this.state.phase==='offline')await this.connect(this.state.user);else await this.flush();}
 dispose(){if(this.timer)clearTimeout(this.timer);++this.epoch;}
}
