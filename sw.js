'use strict';
const C='hf-v8',VERSION='5.2';
const F=['./','index.html','app.js','planning.js','finance.js','depreciation.js','tax-law.js','tax-planner.js','migration.js','demo.js','updates.js','exports.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png','vendor/html2canvas.min.js','vendor/jspdf.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(C);await Promise.all(F.map(async path=>{const request=new Request(path,{cache:'reload'}),response=await fetch(request);if(!response.ok)throw Error('Precache failed: '+path);await c.put(path,response)}));await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(k=>k.startsWith('hf-')&&k!==C).map(k=>caches.delete(k)));await self.clients.claim();for(const client of await self.clients.matchAll({type:'window'}))client.postMessage({type:'APP_UPDATED',version:VERSION})})())});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 // HTML and every application script bypass HTTP and SW caches while online.
 const fresh=e.request.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('.js');
 e.respondWith((async()=>{const cache=await caches.open(C);try{const response=await fetch(e.request,fresh?{cache:'no-store'}:{});if(!response.ok)throw Error('HTTP '+response.status);e.waitUntil(cache.put(e.request,response.clone()));return response}catch(error){const hit=await cache.match(e.request,{ignoreSearch:true});if(hit)return hit;if(e.request.mode==='navigate'){const index=await cache.match('index.html');if(index)return index}return new Response('Offline: reopen online once to finish the update.',{status:503,headers:{'Content-Type':'text/plain'}})}})());
});
