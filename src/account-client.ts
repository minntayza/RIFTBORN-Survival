import {createClient,type SupabaseClient,type User} from '@supabase/supabase-js';
import {checkedCloud,ProgressConflict,type AccountUser,type ProgressRemote} from './account-progress';
import type {Progress} from './save';
export type PublicAccountConfig={url?:string;key?:string};
export function validAccountConfig(config:PublicAccountConfig){try{const u=new URL(config.url||'');if(!(u.protocol==='https:'||u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname))||!config.key)return false;if(config.key.startsWith('sb_publishable_'))return true;const parts=config.key.split('.');if(parts.length!==3)return false;try{return JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';}catch{return false;}}catch{return false;}}
export function accountUser(user:User):AccountUser{const raw=user.user_metadata?.display_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Survivor';return{id:user.id,name:String(raw).trim().slice(0,32)||'Survivor',email:user.email};}
export class SupabaseProgressRemote implements ProgressRemote{
 constructor(private client:SupabaseClient){}
 async read(userId:string){const {data,error}=await this.client.from('player_progress').select('progress,revision').eq('user_id',userId).maybeSingle();if(error)throw error;return data?checkedCloud(data):null;}
 async write(_userId:string,progress:Progress,revision:number|null){const {data,error}=await this.client.rpc('save_player_progress',{p_progress:progress,p_expected_revision:revision});if(error){if(error.code==='40001')throw new ProgressConflict();throw error;}return checkedCloud(data);}
}
export function createAccountClient(config:PublicAccountConfig){if(!validAccountConfig(config))return null;return createClient(config.url!,config.key!,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}
export const cleanEmail=(value:string)=>value.trim().toLowerCase();
export const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const validEmailCode=(value:string)=>/^\d{6,10}$/.test(value.trim());

export class AccountSignInUnavailable extends Error {}
export async function checkGoogleSignIn(config:PublicAccountConfig,request:typeof fetch=fetch){
 if(!validAccountConfig(config))throw new AccountSignInUnavailable('Google sign-in is still being set up. You can keep playing as Guest.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
 try{
  const response=await request(config.url!.replace(/\/$/,'')+'/auth/v1/settings',{headers:{apikey:config.key!},signal:controller.signal,cache:'no-store'});
  if(!response.ok)throw new Error('Authentication service unavailable');
  const settings=await response.json();
  if(settings.external?.google!==true)throw new AccountSignInUnavailable('Google sign-in is still being set up. You can keep playing as Guest.');
 }catch(error){
  if(error instanceof AccountSignInUnavailable)throw error;
  throw new AccountSignInUnavailable('Cannot reach sign-in right now. Try another network or try again later. Your guest progress is safe.');
 }finally{clearTimeout(timer);}
}
