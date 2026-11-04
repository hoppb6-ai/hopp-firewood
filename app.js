'use strict';
/* ================= STORAGE MODULE =================
 * TODO(Firebase sync): Replace the localStorage internals below with Firebase Firestore.
 *  - load(): read a doc (e.g. /businesses/hopp/data/state) and onSnapshot() into `state`.
 *  - save(): write via setDoc/updateDoc (ideally per-collection docs).
 *  - subscribe(fn): call fn whenever an onSnapshot update arrives (live sync between both phones).
 *  Keep this same API (load, save, subscribe) so the rest of the app needs no changes.
 */
const Storage=(()=>{const KEY='hf.data.v1';const subs=[];
  return{load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}},
    save(d){localStorage.setItem(KEY,JSON.stringify(d));subs.forEach(f=>f(d))},
    subscribe(fn){subs.push(fn);return()=>subs.splice(subs.indexOf(fn),1)}}})();

/* ================= AUTH MODULE =================
 * v1: local-only users (SHA-256 + random salt via WebCrypto). Only gates the app on THIS device.
 * TODO(Firebase Auth): Replace with Firebase Authentication (email/password).
 *  Remember me -> setPersistence(browserLocalPersistence) else browserSessionPersistence.
 *  signIn -> signInWithEmailAndPassword, signOut -> signOut, onChange -> onAuthStateChanged.
 */
const Auth=(()=>{const UK='hf.users',SK='hf.session';const subs=[];
  const users=()=>JSON.parse(localStorage.getItem(UK)||'[]');
  const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  async function hash(pw,salt){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw)))}
  const emit=()=>subs.forEach(f=>f(Auth.currentUser()));
  return{hasUsers:()=>users().length>0,listUsers:()=>users().map(u=>u.username),
    async createUser(username,pw){username=username.trim();if(!username||pw.length<4)throw Error('Username and a password of 4+ characters required');
      const us=users();if(us.some(u=>u.username.toLowerCase()===username.toLowerCase()))throw Error('That username exists');
      const salt=hex(crypto.getRandomValues(new Uint8Array(16)));us.push({username,salt,hash:await hash(pw,salt)});localStorage.setItem(UK,JSON.stringify(us))},
    async signIn(username,pw,remember){const u=users().find(x=>x.username.toLowerCase()===username.trim().toLowerCase());
      if(!u||await hash(pw,u.salt)!==u.hash)throw Error('Wrong username or password');
      localStorage.removeItem(SK);sessionStorage.removeItem(SK);(remember?localStorage:sessionStorage).setItem(SK,u.username);emit()},
    signOut(){localStorage.removeItem(SK);sessionStorage.removeItem(SK);emit()},
    currentUser(){const n=localStorage.getItem(SK)||sessionStorage.getItem(SK);return n&&users().some(u=>u.username===n)?n:null},
    onChange(fn){subs.push(fn)}}})();

/* ================= HELPERS ================= */
const $=s=>document.querySelector(s);
const money=n=>(n<0?'-':'')+'$'+Math.abs(+n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const me=()=>Auth.currentUser()||'?';
const CATS=['Fuel','Equipment','Supplies','Packaging','Vehicle','Fees/Licenses','Other'];
const BIZ='Hopp & Billy Hardwood (placeholder)';
function seed(){return{products:[{id:uid(),name:'Pizza oven wood',unit:'box',price:35,qty:10},{id:uid(),name:'Smoker chunks',unit:'bag',price:15,qty:20},{id:uid(),name:'Firewood bundle',unit:'bundle',price:8,qty:30}],
  accounts:[{id:uid(),business:'New Holland Knickerbocker',contact:'',phone:'',email:'',address:'Bridge St, Grand Rapids, MI',notes:'',usual:'',priceNotes:''}],
  invoices:[],expenses:[],stockLog:[],nextInvoice:1001,taxRate:0,lastBackup:null}}
let D=Storage.load()||seed();
function save(){Storage.save(D)}
let tab='inv';
Storage.subscribe(()=>render());
Auth.onChange(()=>boot());

function modal(html){$('#mbody').innerHTML=html;$('#modal').style.display='flex'}
function closeModal(){$('#modal').style.display='none'}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
const val=id=>document.getElementById(id).value;

/* ================= AUTH SCREENS ================= */
function authScreen(){$('#nav').style.display='none';$('#who').textContent='';
  const setup=!Auth.hasUsers();
  $('#app').innerHTML=`<div class="card"><h2>${setup?'Create first user':'Sign in'}</h2>
  ${setup?'<p class="muted">First run on this device. Create your login; you can add your partner afterward under More.</p>':''}
  <label>Username</label><input id="au" autocomplete="username" autocapitalize="none">
  <label>Password</label><input id="ap" type="password" autocomplete="${setup?'new-password':'current-password'}">
  <label class="row" style="justify-content:flex-start"><input id="ar" type="checkbox" style="width:24px;flex:0" checked> Remember me on this device</label>
  <p id="aerr" style="color:var(--bad)"></p><button id="ago" style="width:100%">${setup?'Create & sign in':'Sign in'}</button></div>`;
  $('#ago').onclick=async()=>{try{if(setup)await Auth.createUser(val('au'),val('ap'));await Auth.signIn(val('au'),val('ap'),$('#ar').checked)}catch(e){$('#aerr').textContent=e.message}};
}

/* ================= TABS ================= */
const TABS=[['inv','📦','Inventory'],['acc','🍕','Accounts'],['bill','🧾','Invoices'],['exp','💸','Expenses'],['more','⋯','More']];
function render(){if(!Auth.currentUser())return authScreen();
  $('#who').textContent='👤 '+me();$('#nav').style.display='flex';
  $('#nav').innerHTML=TABS.map(([k,i,l])=>`<button class="${k===tab?'on':''}" onclick="tab='${k}';render();scrollTo(0,0)"><div style="font-size:20px">${i}</div>${l}</button>`).join('');
  $('#app').innerHTML=({inv:vInv,acc:vAcc,bill:vBill,exp:vExp,more:vMore})[tab]();}

/* ---- Inventory ---- */
function vInv(){return `<div class="between"><h2>Inventory</h2><button onclick="editProd()">+ Product</button></div>`+
 D.products.map(p=>`<div class="card"><div class="between"><div><b>${esc(p.name)}</b><div class="muted">${money(p.price)} / ${esc(p.unit)}</div></div><button class="sec sm" onclick="editProd('${p.id}')">Edit</button></div>
 <div class="row" style="margin-top:8px"><button class="sm" onclick="adj('${p.id}',-1)">−</button><div style="text-align:center;font-size:22px;font-weight:700">${p.qty} <span class="muted">${esc(p.unit)}</span></div><button class="sm" onclick="adj('${p.id}',1)">+</button></div></div>`).join('')+
 `<h3>Stock history</h3><div class="card">${D.stockLog.slice(-50).reverse().map(l=>`<div class="between muted"><span>${new Date(l.at).toLocaleString()} · ${esc(l.by)}</span><span>${esc(l.name)} ${l.delta>0?'+':''}${l.delta} (${esc(l.reason)})</span></div>`).join('')||'<span class="muted">No changes yet</span>'}</div>`}
function logStock(p,delta,reason){D.stockLog.push({at:Date.now(),by:me(),pid:p.id,name:p.name,delta,reason});if(D.stockLog.length>1000)D.stockLog.shift()}
function adj(id,d){const p=D.products.find(x=>x.id===id);p.qty=+p.qty+d;logStock(p,d,'manual');save()}
function editProd(id){const p=D.products.find(x=>x.id===id)||{name:'',unit:'box',price:0,qty:0};
 modal(`<h2>${id?'Edit':'New'} product</h2><label>Name</label><input id="pn" value="${esc(p.name)}"><label>Unit</label><input id="pu" value="${esc(p.unit)}">
 <div class="row"><div><label>Unit price</label><input id="pp" type="number" step="0.01" inputmode="decimal" value="${p.price}"></div><div><label>On hand</label><input id="pq" type="number" inputmode="numeric" value="${p.qty}"></div></div>
 <div class="row"><button onclick="saveProd('${id||''}')">Save</button>${id?`<button class="bad" onclick="if(confirm('Delete product?')){D.products=D.products.filter(x=>x.id!=='${id}');save();closeModal()}">Delete</button>`:''}<button class="sec" onclick="closeModal()">Cancel</button></div>`)}
function saveProd(id){let p=D.products.find(x=>x.id===id);const q=+val('pq')||0;
 if(!p){p={id:uid(),qty:0};D.products.push(p)}const old=+p.qty;Object.assign(p,{name:val('pn')||'Product',unit:val('pu'),price:+val('pp')||0,qty:q});
 if(q!==old)logStock(p,q-old,id?'edit':'new');save();closeModal()}

/* ---- Accounts ---- */
const AF=[['business','Business name'],['contact','Contact name'],['phone','Phone'],['email','Email'],['address','Address'],['notes','Delivery notes'],['usual','Usual order'],['priceNotes','Price notes']];
function vAcc(){return `<div class="between"><h2>Accounts</h2><button onclick="editAcc()">+ Account</button></div>`+D.accounts.map(a=>`<div class="card" onclick="editAcc('${a.id}')"><b>${esc(a.business)}</b><div class="muted">${esc([a.contact,a.phone,a.address].filter(Boolean).join(' · '))}</div>${a.usual?`<div class="muted">Usual: ${esc(a.usual)}</div>`:''}</div>`).join('')}
function editAcc(id){const a=D.accounts.find(x=>x.id===id)||{};
 modal(`<h2>${id?'Edit':'New'} account</h2>`+AF.map(([k,l])=>`<label>${l}</label>${['notes','usual','priceNotes'].includes(k)?`<textarea id="a_${k}">${esc(a[k])}</textarea>`:`<input id="a_${k}" value="${esc(a[k])}" ${k==='phone'?'type="tel"':k==='email'?'type="email"':''}>`}`).join('')+
 `<div class="row"><button onclick="saveAcc('${id||''}')">Save</button>${id?`<button class="bad" onclick="if(confirm('Delete account?')){D.accounts=D.accounts.filter(x=>x.id!=='${id}');save();closeModal()}">Delete</button>`:''}<button class="sec" onclick="closeModal()">Cancel</button></div>`)}
function saveAcc(id){let a=D.accounts.find(x=>x.id===id);if(!a){a={id:uid()};D.accounts.push(a)}AF.forEach(([k])=>a[k]=val('a_'+k));if(!a.business)a.business='Customer';save();closeModal()}

/* ---- Invoices ---- */
const itot=i=>{const s=i.lines.reduce((t,l)=>t+l.qty*l.price,0),tax=s*(+i.taxRate||0)/100;return{s,tax,t:s+tax}};
const accName=id=>(D.accounts.find(a=>a.id===id)||{}).business||'(deleted account)';
function vBill(){const un=D.invoices.filter(i=>!i.paid).reduce((t,i)=>t+itot(i).t,0);
 return `<div class="between"><h2>Invoices</h2><button onclick="editInv()">+ Invoice</button></div><div class="muted">Unpaid total: <b>${money(un)}</b></div>`+
 D.invoices.slice().reverse().map(i=>`<div class="card" onclick="viewInv('${i.id}')"><div class="between"><b>#${i.num} · ${esc(accName(i.accountId))}</b><b>${money(itot(i).t)}</b></div>
 <div class="between muted"><span>${i.date} · by ${esc(i.by)}</span><span>${i.delivered?'<span class="tag del">delivered</span> ':''}<span class="tag ${i.paid?'paid':'unpaid'}">${i.paid?'paid':'unpaid'}</span></span></div></div>`).join('')}
let draft=null;
function editInv(id){const i=D.invoices.find(x=>x.id===id);draft=i?JSON.parse(JSON.stringify(i)):{id:null,accountId:(D.accounts[0]||{}).id,date:today(),lines:[],taxRate:D.taxRate,note:''};drawDraft()}
function drawDraft(){const t=itot(draft);
 modal(`<h2>${draft.id?'Edit invoice #'+draft.num:'New invoice'}</h2><label>Account</label><select id="ia" onchange="draft.accountId=this.value">${D.accounts.map(a=>`<option value="${a.id}" ${a.id===draft.accountId?'selected':''}>${esc(a.business)}</option>`).join('')}</select>
 <label>Date</label><input id="id" type="date" value="${draft.date}" onchange="draft.date=this.value">
 <h3>Line items</h3>${draft.lines.map((l,n)=>`<div class="card"><div class="between"><b>${esc(l.name)}</b><button class="bad sm" onclick="draft.lines.splice(${n},1);drawDraft()">✕</button></div><div class="row"><div><label>Qty</label><input type="number" inputmode="decimal" value="${l.qty}" onchange="draft.lines[${n}].qty=+this.value||0;drawDraft()"></div><div><label>Price</label><input type="number" step="0.01" inputmode="decimal" value="${l.price}" onchange="draft.lines[${n}].price=+this.value||0;drawDraft()"></div><div class="r"><label>Amount</label><div>${money(l.qty*l.price)}</div></div></div></div>`).join('')}
 <select onchange="if(this.value){const p=D.products.find(x=>x.id===this.value);draft.lines.push({pid:p.id,name:p.name+' ('+p.unit+')',qty:1,price:p.price});drawDraft()}"><option value="">+ Add product…</option>${D.products.map(p=>`<option value="${p.id}">${esc(p.name)} – ${money(p.price)}</option>`).join('')}</select>
 <label>Tax % (optional)</label><input type="number" step="0.01" inputmode="decimal" value="${draft.taxRate||0}" onchange="draft.taxRate=+this.value||0;drawDraft()">
 <label>Note</label><input value="${esc(draft.note)}" onchange="draft.note=this.value">
 <div class="card"><div class="between"><span>Subtotal</span><span>${money(t.s)}</span></div><div class="between"><span>Tax</span><span>${money(t.tax)}</span></div><div class="between"><b>Total</b><b>${money(t.t)}</b></div></div>
 <div class="row"><button onclick="saveInv()">Save</button><button class="sec" onclick="closeModal()">Cancel</button></div>`)}
function saveInv(){if(!draft.accountId)return alert('Add an account first');if(!draft.lines.length)return alert('Add at least one line item');
 if(draft.id){const n=D.invoices.findIndex(x=>x.id===draft.id);D.invoices[n]=draft}else{draft.id=uid();draft.num=D.nextInvoice++;draft.by=me();draft.createdAt=Date.now();draft.paid=false;draft.delivered=false;D.invoices.push(draft)}
 D.taxRate=draft.taxRate;const id=draft.id;save();viewInv(id)}
function viewInv(id){const i=D.invoices.find(x=>x.id===id),t=itot(i);
 modal(`<div class="between"><h2>Invoice #${i.num}</h2><button class="sec sm" onclick="closeModal()">✕</button></div><div><b>${esc(accName(i.accountId))}</b> · ${i.date}</div><div class="muted">Created by ${esc(i.by)}${i.deliveredBy?' · delivered by '+esc(i.deliveredBy):''}</div>
 <table>${i.lines.map(l=>`<tr><td>${esc(l.name)}</td><td class="r">${l.qty} × ${money(l.price)}</td><td class="r">${money(l.qty*l.price)}</td></tr>`).join('')}<tr><td colspan=2 class="r">Total</td><td class="r"><b>${money(t.t)}</b></td></tr></table>
 <div class="row" style="margin-top:12px"><button onclick="togglePaid('${id}')">${i.paid?'Mark unpaid':'Mark paid'}</button>${i.delivered?'':`<button onclick="deliver('${id}')">Mark delivered</button>`}</div>
 <div class="row" style="margin-top:8px"><button class="sec" onclick="printInv('${id}')">🖨 Print</button><button class="sec" onclick="editInv('${id}')">Edit</button><button class="bad" onclick="if(confirm('Delete invoice #${i.num}?')){D.invoices=D.invoices.filter(x=>x.id!=='${id}');save();closeModal()}">Delete</button></div>`)}
function togglePaid(id){const i=D.invoices.find(x=>x.id===id);i.paid=!i.paid;i.paidAt=i.paid?Date.now():null;save();viewInv(id)}
function deliver(id){const i=D.invoices.find(x=>x.id===id);i.delivered=true;i.deliveredBy=me();
 if(confirm('Deduct these items from inventory?'))i.lines.forEach(l=>{const p=D.products.find(x=>x.id===l.pid);if(p){p.qty=+p.qty-l.qty;logStock(p,-l.qty,'invoice #'+i.num)}});save();viewInv(id)}
function printInv(id){const i=D.invoices.find(x=>x.id===id),t=itot(i),a=D.accounts.find(x=>x.id===i.accountId)||{};
 $('#print').innerHTML=`<div style="font-family:Georgia,serif"><div style="display:flex;justify-content:space-between"><div><h1 style="margin:0">${BIZ}</h1><div>Kiln-dried hardwood · Grand Rapids, MI</div></div><div style="text-align:right"><h2 style="margin:0">INVOICE</h2><div>#${i.num}</div><div>${i.date}</div><div><b>${i.paid?'PAID':'DUE'}</b></div></div></div>
 <hr><div><b>Bill to:</b><br>${esc(a.business)}<br>${esc(a.contact)}<br>${esc(a.address)}<br>${esc(a.phone)} ${esc(a.email)}</div><br>
 <table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;border-bottom:2px solid #000">Item</th><th style="text-align:right;border-bottom:2px solid #000">Qty</th><th style="text-align:right;border-bottom:2px solid #000">Price</th><th style="text-align:right;border-bottom:2px solid #000">Amount</th></tr>
 ${i.lines.map(l=>`<tr><td>${esc(l.name)}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${money(l.price)}</td><td style="text-align:right">${money(l.qty*l.price)}</td></tr>`).join('')}</table>
 <div style="margin-left:auto;width:40%;margin-top:12px"><div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${money(t.s)}</span></div>${i.taxRate?`<div style="display:flex;justify-content:space-between"><span>Tax (${i.taxRate}%)</span><span>${money(t.tax)}</span></div>`:''}<div style="display:flex;justify-content:space-between;font-size:1.2em;border-top:2px solid #000"><b>Total</b><b>${money(t.t)}</b></div></div>
 ${i.note?`<p>${esc(i.note)}</p>`:''}<p style="margin-top:40px">Thank you for your business!</p></div>`;window.print()}

/* ---- Expenses ---- */
function vExp(){const y=String(new Date().getFullYear()),ytd=D.expenses.filter(e=>e.date.startsWith(y));const by={};ytd.forEach(e=>by[e.category]=(by[e.category]||0)+e.amount);
 return `<div class="between"><h2>Expenses</h2><button onclick="editExp()">+ Expense</button></div>
 <div class="card"><b>${y} year to date</b>${CATS.filter(c=>by[c]).map(c=>`<div class="between"><span>${c}</span><span>${money(by[c])}</span></div>`).join('')}<div class="between" style="border-top:1px solid #ccc;margin-top:4px"><b>Total</b><b>${money(ytd.reduce((t,e)=>t+e.amount,0))}</b></div>
 <button class="sec" style="width:100%;margin-top:8px" onclick="expCSV()">⬇ Export CSV for taxes</button></div>`+
 D.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<div class="card" onclick="editExp('${e.id}')"><div class="between"><b>${esc(e.vendor||e.category)}</b><b>${money(e.amount)}</b></div><div class="muted">${e.date} · ${e.category} · by ${esc(e.by)}${e.note?' · '+esc(e.note):''}</div></div>`).join('')}
function editExp(id){const e=D.expenses.find(x=>x.id===id)||{date:today(),amount:'',category:'Fuel',vendor:'',note:''};
 modal(`<h2>${id?'Edit':'New'} expense</h2><label>Date</label><input id="ed" type="date" value="${e.date}"><label>Amount</label><input id="ea" type="number" step="0.01" inputmode="decimal" value="${e.amount}">
 <label>Category</label><select id="ec">${CATS.map(c=>`<option ${c===e.category?'selected':''}>${c}</option>`).join('')}</select><label>Vendor</label><input id="ev" value="${esc(e.vendor)}"><label>Note</label><input id="en" value="${esc(e.note)}">
 <div class="row"><button onclick="saveExp('${id||''}')">Save</button>${id?`<button class="bad" onclick="if(confirm('Delete expense?')){D.expenses=D.expenses.filter(x=>x.id!=='${id}');save();closeModal()}">Delete</button>`:''}<button class="sec" onclick="closeModal()">Cancel</button></div>`)}
function saveExp(id){const amt=+val('ea');if(!(amt>0))return alert('Enter an amount');let e=D.expenses.find(x=>x.id===id);if(!e){e={id:uid(),by:me()};D.expenses.push(e)}
 Object.assign(e,{date:val('ed')||today(),amount:amt,category:val('ec'),vendor:val('ev'),note:val('en')});save();closeModal()}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function expCSV(){const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
 download('expenses-'+today()+'.csv',['Date,Amount,Category,Vendor,Note,Entered by',...D.expenses.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>[e.date,e.amount.toFixed(2),q(e.category),q(e.vendor),q(e.note),q(e.by)].join(','))].join('\n'),'text/csv')}

/* ---- More / Backup / Users ---- */
function vMore(){return `<h2>More</h2><div class="card"><b>Backup</b><div class="muted">Last backup: ${D.lastBackup?new Date(D.lastBackup).toLocaleString():'never'}</div>
 <div class="row" style="margin-top:8px"><button onclick="backup()">⬇ Export backup</button><button class="sec" onclick="$('#imp').click()">⬆ Import</button></div><input id="imp" type="file" accept=".json,application/json" style="display:none" onchange="importFile(this)"></div>
 <div class="card"><b>Users on this device</b><div class="muted">${Auth.listUsers().map(esc).join(', ')}</div><label>New username</label><input id="nu" autocapitalize="none"><label>Password</label><input id="np" type="password" autocomplete="new-password"><button onclick="addUser()">Add user</button></div>
 <div class="card"><div class="muted">Signed in as <b>${esc(me())}</b>. Local login only protects this device.</div><button class="bad" style="width:100%;margin-top:8px" onclick="Auth.signOut()">Sign out</button></div>`}
async function addUser(){try{await Auth.createUser(val('nu'),val('np'));alert('User added');render()}catch(e){alert(e.message)}}
function backup(){D.lastBackup=Date.now();save();download('hopp-firewood-backup-'+today()+'.json',JSON.stringify({app:'hopp-firewood',version:1,exportedAt:new Date().toISOString(),data:D},null,2),'application/json')}
function importFile(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result),d=j.data||j;
 if(!Array.isArray(d.products)||!Array.isArray(d.invoices))throw Error('Not a Hopp Firewood backup');
 if(confirm(`Replace ALL current data with this backup (${d.products.length} products, ${(d.accounts||[]).length} accounts, ${d.invoices.length} invoices, ${(d.expenses||[]).length} expenses)?`)){D=Object.assign(seed(),d);save();alert('Imported')}}catch(e){alert('Import failed: '+e.message)}inp.value=''};r.readAsText(f)}
let backupAsked=false;
function maybeAskBackup(){if(backupAsked)return;backupAsked=true;if(D.lastBackup&&Date.now()-D.lastBackup<7*864e5)return;
 modal(`<h2>Save a backup now?</h2><p class="muted">${D.lastBackup?'Last backup was '+Math.floor((Date.now()-D.lastBackup)/864e5)+' days ago.':'You have never saved a backup.'}</p><div class="row"><button onclick="backup();closeModal()">Save</button><button class="sec" onclick="closeModal()">Later</button></div>`)}

function boot(){closeModal();render();if(Auth.currentUser())maybeAskBackup()}
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
