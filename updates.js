'use strict';
let appRegistration=null,updateShown=false;
function showAppUpdate(){if(updateShown)return;updateShown=true;const banner=document.getElementById('update-banner');banner.hidden=false;banner.innerHTML='<button onclick="reloadAppUpdate()">Update available - tap to reload</button>';}
function reloadAppUpdate(){appRegistration?.waiting?.postMessage({type:'SKIP_WAITING'});location.reload();}
async function startAppUpdates(){
 if(!('serviceWorker' in navigator))return;
 const wasControlled=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(wasControlled)showAppUpdate()});
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='APP_UPDATED'&&wasControlled)showAppUpdate()});
 try{
  const reg=await navigator.serviceWorker.register('sw.js',{updateViaCache:'none'});appRegistration=reg;
  if(reg.waiting&&navigator.serviceWorker.controller)showAppUpdate();
  reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&wasControlled)showAppUpdate()})});
  const check=()=>{if(navigator.onLine)reg.update().catch(()=>{})};
  check();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});window.addEventListener('online',check);setInterval(check,60000);
 }catch(e){/* Offline first launch: normal page use and backups remain available. */}
}
