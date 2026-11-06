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

/* ================= SESSION PIN =================
 * Client-side soft gate only, NOT authentication or encryption. The test PIN is
 * public in this static source; never use this to protect sensitive information.
 * sessionStorage remembers unlock only for this browser tab's session.
 * Legacy hf.users / hf.session data is intentionally untouched but not used.
 */
const Auth=(()=>{const KEY='hf.pin.unlocked';const subs=[];
 return{currentUser:()=>sessionStorage.getItem(KEY)==='yes'?(localStorage.getItem('hf.operator')||'Brandon'):null,
 unlock(pin){if(pin!=='1234')return false;sessionStorage.setItem(KEY,'yes');subs.forEach(f=>f());return true},
 signOut(){sessionStorage.removeItem(KEY);subs.forEach(f=>f())},
 onChange(fn){subs.push(fn)}}})();

/* ================= HELPERS ================= */
const $=s=>document.querySelector(s);
const money=n=>(n<0?'-':'')+'$'+Math.abs(+n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const me=()=>Auth.currentUser()||'?';
const CATS=['Fuel','Equipment','Supplies','Packaging','Vehicle','Fees/Licenses','Other'];
const BIZ='Hopp Firewood';
function emptyData(){return{products:[],accounts:[],invoices:[],expenses:[],stockLog:[],nextInvoice:1001,taxRate:0,lastBackup:null,sampleData:false,schemaVersion:4,projects:[],goals:[],events:[],currentProjectId:null}}
function seed(){
 const d=emptyData(), day=n=>{const t=new Date();t.setDate(t.getDate()+n);return new Date(t-t.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
 d.sampleData=true;
 d.products=[{id:'wood',name:'Kiln-dried firewood',unit:'bundle',price:8,qty:120},{id:'pizza',name:'Pizza-oven hardwood splits',unit:'box',price:35,qty:48},{id:'smoker',name:'Smoker hardwood chunks',unit:'bag',price:15,qty:65}];
 d.accounts=[
 {id:'nh',business:'New Holland Knickerbocker',contact:'',phone:'',email:'',address:'Grand Rapids, MI',notes:'Sample delivery details — confirm receiving instructions before delivery.',usual:'8 boxes pizza-oven wood',priceNotes:'Sample pricing: $35 / box'},
 {id:'sample-pizza',business:'Riverbend Pizza Co. (Sample)',contact:'Sample customer',address:'Fictional Grand Rapids business',notes:'Sample: use rear receiving entrance.',usual:'6 boxes pizza-oven wood'},
 {id:'sample-bbq',business:'Lakeshore Smokehouse (Sample)',contact:'Sample customer',address:'Fictional West Michigan business',notes:'Sample: call before delivery.',usual:'12 bags smoker wood'},
 {id:'sample-home',business:'Maple Grove Campground (Sample)',contact:'Sample customer',address:'Fictional West Michigan campground',notes:'Sample: stack at woodshed.',usual:'30 firewood bundles'}];
 const line=(id,qty)=>{const p=d.products.find(p=>p.id===id);return{pid:id,name:p.name+' ('+p.unit+')',qty,price:p.price}};
 const invoice=(id,num,accountId,offset,lines,paid,delivered,by)=>({id,num,accountId,date:day(offset),lines,paid,delivered,by,taxRate:0,note:'SAMPLE INVOICE — demonstration only, not an actual charge.',createdAt:Date.now(),...(delivered?{deliveredBy:by}:{}),...(paid?{paidAt:Date.now()}: {})});
 d.invoices=[invoice('sample-1001',1001,'nh',-7,[line('pizza',8),line('smoker',4)],true,true,'Brandon'),invoice('sample-1002',1002,'sample-bbq',-3,[line('smoker',12)],false,true,'Billy'),invoice('sample-1003',1003,'sample-pizza',1,[line('pizza',6)],false,false,'Brandon'),invoice('sample-1004',1004,'sample-home',2,[line('wood',30)],false,false,'Billy'),invoice('sample-1005',1005,'nh',0,[line('pizza',8)],false,false,'Billy')];
 d.expenses=[{id:'fuel',date:day(-2),amount:62.40,category:'Fuel',vendor:'Delivery fuel (Sample)',note:'Sample expense',by:'Billy'},{id:'bags',date:day(-5),amount:48,category:'Packaging',vendor:'Wood bags & labels (Sample)',note:'Sample expense',by:'Brandon'},{id:'supplies',date:day(-8),amount:95,category:'Supplies',vendor:'Kiln supplies (Sample)',note:'Sample expense',by:'Brandon'}];
 d.stockLog=d.products.map(p=>({at:Date.now()-86400000,by:'Brandon',pid:p.id,name:p.name,delta:p.qty,reason:'Sample opening stock'}));
 d.nextInvoice=1006;return addPlanningSamples(d);
}
// Seed once only when this app's data key is absent. An intentionally cleared
// (persisted empty) dataset stays empty across reloads. Never replace saved data.
let D;
try{const raw=localStorage.getItem('hf.data.v1');D=raw===null?seed():JSON.parse(raw);if(!D||!Array.isArray(D.products)||!Array.isArray(D.accounts)||!Array.isArray(D.invoices)||!Array.isArray(D.expenses)||!Array.isArray(D.stockLog))throw Error('Invalid saved data');if(raw===null)Storage.save(D)}
catch(e){document.getElementById('app').textContent='Saved data could not be read. Export or recover your browser storage before continuing.';throw e}
function save(){Storage.save(D)}
let tab='home';
Storage.subscribe(()=>render());
Auth.onChange(()=>boot());

function modal(html){$('#mbody').innerHTML=html;$('#modal').style.display='flex'}
function closeModal(){$('#modal').style.display='none';if(typeof clearExportPreview==='function')clearExportPreview();$('#mbody').innerHTML=''}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
const val=id=>document.getElementById(id).value;

/* ================= AUTH SCREENS ================= */
let pinEntry='';
function authScreen(){pinEntry='';$('#nav').style.display='none';$('#who').textContent='';
 $('#app').innerHTML=`<section class="pin-screen"><div class="pin-mark">HF</div><p class="eyebrow">HOPP FIREWOOD</p><h2>Welcome back</h2><p class="muted">Enter your 4-digit PIN to unlock</p><div id="pin-dots" class="pin-dots" aria-label="0 of 4 digits entered">${'<span></span>'.repeat(4)}</div><p id="aerr" role="status" aria-live="polite"></p><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="pinKey('${n}')">${n}</button>`).join('')}<button class="sec" onclick="pinKey('clear')" aria-label="Clear PIN">Clear</button><button onclick="pinKey('0')">0</button><button class="sec" onclick="pinKey('back')" aria-label="Delete last digit">⌫</button></div><p class="muted">Test PIN: 1234</p><p class="pin-note muted">Device-only soft lock · Data stays on this browser</p></section>`;
}
function pinKey(key){if(Auth.currentUser())return;
 if(key==='clear')pinEntry='';else if(key==='back')pinEntry=pinEntry.slice(0,-1);else if(/^\d$/.test(key)&&pinEntry.length<4)pinEntry+=key;
 $('#aerr').textContent='';
 if(pinEntry.length===4){if(Auth.unlock(pinEntry))return;pinEntry='';$('#aerr').textContent='Incorrect PIN. Try again.'}
 $('#pin-dots').innerHTML=[0,1,2,3].map(n=>`<span class="${n<pinEntry.length?'filled':''}"></span>`).join('');$('#pin-dots').setAttribute('aria-label',`${pinEntry.length} of 4 digits entered`);
}
document.addEventListener('keydown',e=>{if(Auth.currentUser()||e.altKey||e.metaKey||e.ctrlKey)return;if(/^\d$/.test(e.key)||['Backspace','Escape'].includes(e.key)){e.preventDefault();pinKey(e.key==='Backspace'?'back':e.key==='Escape'?'clear':e.key)}});

/* ================= TABS ================= */
const ICONS={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',inv:'<path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10M7 5l10 4"/>',acc:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',bill:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h3"/>',exp:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 14h5M6 5V3h12"/>',more:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="9" cy="18" r="2" fill="currentColor"/>'};
const icon=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const TABS=[['home','Home'],['inv','Stock'],['acc','Clients'],['bill','Invoices'],['exp','Costs'],['more','More']];
function render(){if(!Auth.currentUser())return authScreen();
 $('#who').innerHTML=`<button class="lock" onclick="Auth.signOut()" aria-label="Lock app">Lock</button>`;$('#nav').style.display='flex';
 $('#nav').innerHTML=TABS.map(([k,l])=>`<button class="${(k===tab||(k==='more'&&['projects','goals','deliveries','settings'].includes(tab)))?'on':''}" ${k===tab?'aria-current="page"':''} onclick="tab='${k}';render();scrollTo(0,0)">${icon(k)}<span>${l}${k==='more'&&reminderCount()?` <small class="nav-badge">${reminderCount()}</small>`:''}</span></button>`).join('');
 $('#app').dataset.view=tab;$('#app').innerHTML=(D.sampleData?'<div class="sample-banner">Sample workspace · Demonstration records</div>':'')+`<div class="page-tools"><span>${PAGE_TITLES[tab]||'Workspace'}</span><button class="sec sm" onclick="exportMenu()" aria-label="Export this page">Export</button></div>`+({home:vCalendarHome,inv:vInv,acc:vAcc,bill:vBill,exp:vExp,more:vMore,projects:vProjects,goals:vGoals,deliveries:vDeliveries,settings:vSettings})[tab]();}
/* ---- Inventory ---- */
function vInv(){return `<div class="between"><h2>Inventory</h2><button onclick="editProd()">+ Product</button></div>`+
 D.products.map(p=>`<div class="card"><div class="between"><div><b>${esc(p.name)}</b><div class="muted">${money(p.price)} / ${esc(p.unit)}</div></div><button class="sec sm" onclick="editProd('${p.id}')">Edit</button></div>
 <div class="row stock-adjust" style="margin-top:8px"><button class="sm" onclick="adj('${p.id}',-1)">−</button><div style="text-align:center;font-size:22px;font-weight:700">${p.qty} <span class="muted">${esc(p.unit)}</span></div><button class="sm" onclick="adj('${p.id}',1)">+</button></div></div>`).join('')+
 `<h3>Stock history</h3><div class="card">${D.stockLog.slice(-50).reverse().map(l=>`<div class="between muted"><span>${new Date(l.at).toLocaleString()} · ${esc(l.by)}</span><span>${esc(l.name)} ${l.delta>0?'+':''}${l.delta} (${esc(l.reason)})</span></div>`).join('')||'<span class="muted">No changes yet</span>'}</div>`}
function logStock(p,delta,reason){D.stockLog.push({at:Date.now(),by:me(),pid:p.id,name:p.name,delta,reason});if(D.stockLog.length>1000)D.stockLog.shift()}
function adj(id,d){const p=D.products.find(x=>x.id===id);p.qty=+p.qty+d;logStock(p,d,'manual');save()}
function editProd(id){const p=D.products.find(x=>x.id===id)||{name:'',unit:'box',price:0,qty:0};
 modal(`<h2>${id?'Edit':'New'} product</h2><label>Name</label><input id="pn" value="${esc(p.name)}"><label>Unit</label><input id="pu" value="${esc(p.unit)}">
 <div class="row"><div><label>Unit price</label><input id="pp" type="number" step="0.01" inputmode="decimal" value="${p.price}"></div><div><label>On hand</label><input id="pq" type="number" inputmode="numeric" value="${p.qty}"></div></div>
 <label>Cord equivalents per unit (optional)</label><input id="pc" type="number" min="0" step="any" value="${p.cordsPerUnit||0}"><p class="muted">Used for fulfilled cord goals. Set your actual conversion; sample values are estimates.</p><div class="row"><button onclick="saveProd('${id||''}')">Save</button>${id?`<button class="bad" onclick="if(confirm('Delete product?')){D.products=D.products.filter(x=>x.id!=='${id}');save();closeModal()}">Delete</button>`:''}<button class="sec" onclick="closeModal()">Cancel</button></div>`)}
function saveProd(id){let p=D.products.find(x=>x.id===id);const q=+val('pq')||0;
 if(!p){p={id:uid(),qty:0};D.products.push(p)}const old=+p.qty;Object.assign(p,{name:val('pn')||'Product',unit:val('pu'),price:+val('pp')||0,qty:q,cordsPerUnit:Math.max(0,+val('pc')||0)});
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
 D.invoices.slice().reverse().map(i=>`<div class="card" onclick="viewInv('${i.id}')"><div class="between"><b>#${i.num} · ${esc(accName(i.accountId))}</b><b class="amount">${money(itot(i).t)}</b></div>
 <div class="between muted"><span>${i.date} · Due ${dueDate(i)}${!i.paid&&dueDate(i)<today()?' · OVERDUE':''} · by ${esc(i.by)}</span><span>${i.delivered?'<span class="tag del">delivered</span> ':''}<span class="tag ${i.paid?'paid':'unpaid'}">${i.paid?'paid':'unpaid'}</span></span></div></div>`).join('')}
let draft=null;
function editInv(id){const i=D.invoices.find(x=>x.id===id);draft=i?JSON.parse(JSON.stringify(i)):{id:null,accountId:(D.accounts[0]||{}).id,date:today(),lines:[],taxRate:D.taxRate,note:'',dueDate:today(),deliveryDate:today()};drawDraft()}
function drawDraft(){const t=itot(draft);
 modal(`<h2>${draft.id?'Edit invoice #'+draft.num:'New invoice'}</h2><label>Account</label><select id="ia" onchange="draft.accountId=this.value">${D.accounts.map(a=>`<option value="${a.id}" ${a.id===draft.accountId?'selected':''}>${esc(a.business)}</option>`).join('')}</select>
 <label>Date</label><input id="id" type="date" value="${draft.date}" onchange="draft.date=this.value">
 <div class="row"><div><label>Due date</label><input id="idue" type="date" value="${draft.dueDate||draft.date}" onchange="draft.dueDate=this.value"></div><div><label>Delivery date</label><input id="idelivery" type="date" value="${draft.deliveryDate||draft.date}" onchange="draft.deliveryDate=this.value"></div></div><h3>Line items</h3>${draft.lines.map((l,n)=>`<div class="card"><div class="between"><b>${esc(l.name)}</b><button class="bad sm" onclick="draft.lines.splice(${n},1);drawDraft()">✕</button></div><div class="row"><div><label>Qty</label><input type="number" inputmode="decimal" value="${l.qty}" onchange="draft.lines[${n}].qty=+this.value||0;drawDraft()"></div><div><label>Price</label><input type="number" step="0.01" inputmode="decimal" value="${l.price}" onchange="draft.lines[${n}].price=+this.value||0;drawDraft()"></div><div class="r"><label>Amount</label><div>${money(l.qty*l.price)}</div></div></div></div>`).join('')}
 <select onchange="if(this.value){const p=D.products.find(x=>x.id===this.value);draft.lines.push({pid:p.id,name:p.name+' ('+p.unit+')',qty:1,price:p.price});drawDraft()}"><option value="">+ Add product…</option>${D.products.map(p=>`<option value="${p.id}">${esc(p.name)} – ${money(p.price)}</option>`).join('')}</select>
 <label>Tax % (optional)</label><input type="number" step="0.01" inputmode="decimal" value="${draft.taxRate||0}" onchange="draft.taxRate=+this.value||0;drawDraft()">
 <label>Note</label><input value="${esc(draft.note)}" onchange="draft.note=this.value">
 <div class="card"><div class="between"><span>Subtotal</span><span>${money(t.s)}</span></div><div class="between"><span>Tax</span><span>${money(t.tax)}</span></div><div class="between"><b>Total</b><b>${money(t.t)}</b></div></div>
 <div class="row"><button onclick="saveInv()">Save</button><button class="sec" onclick="closeModal()">Cancel</button></div>`)}
function saveInv(){if(!draft.accountId)return alert('Add an account first');if(!draft.lines.length)return alert('Add at least one line item');
 if(draft.id){const n=D.invoices.findIndex(x=>x.id===draft.id);D.invoices[n]=draft}else{draft.id=uid();draft.num=D.nextInvoice++;draft.by=me();draft.createdAt=Date.now();draft.paid=false;draft.delivered=false;D.invoices.push(draft)}
 D.taxRate=draft.taxRate;const id=draft.id;save();viewInv(id)}
function viewInv(id){const i=D.invoices.find(x=>x.id===id),t=itot(i);
 modal(`<div class="between"><h2>Invoice #${i.num}</h2><button class="sec sm" onclick="closeModal()">✕</button></div><div><b>${esc(accName(i.accountId))}</b> · ${i.date}</div><div class="muted">Due ${dueDate(i)} · Delivery ${i.deliveredDate||deliveryDate(i)}</div><div class="muted">Created by ${esc(i.by)}${i.deliveredBy?' · delivered by '+esc(i.deliveredBy):''}</div>
 ${i.note?`<p class="muted">${esc(i.note)}</p>`:''}<table>${i.lines.map(l=>`<tr><td>${esc(l.name)}</td><td class="r">${l.qty} × ${money(l.price)}</td><td class="r">${money(l.qty*l.price)}</td></tr>`).join('')}<tr><td colspan=2 class="r">Total</td><td class="r"><b>${money(t.t)}</b></td></tr></table>
 <div class="row" style="margin-top:12px"><button onclick="togglePaid('${id}')">${i.paid?'Mark unpaid':'Mark paid'}</button>${i.delivered?'':`<button onclick="deliver('${id}')">Mark delivered</button>`}</div>
 <div class="row" style="margin-top:8px"><button class="sec" onclick="printInv('${id}')">Print</button><button class="sec" onclick="saveInvPng('${id}')">Save as PNG</button><button class="sec" onclick="exportMenu('invoice:${id}')">Export invoice</button><button class="sec" onclick="editInv('${id}')">Edit</button><button class="bad" onclick="if(confirm('Delete invoice #${i.num}?')){D.invoices=D.invoices.filter(x=>x.id!=='${id}');save();closeModal()}">Delete</button></div>`)}
function togglePaid(id){const i=D.invoices.find(x=>x.id===id);i.paid=!i.paid;i.paidAt=i.paid?Date.now():null;save();viewInv(id)}
function deliver(id){const i=D.invoices.find(x=>x.id===id);i.delivered=true;i.deliveredBy=me();i.deliveredDate=today();
 if(confirm('Deduct these items from inventory?'))i.lines.forEach(l=>{const p=D.products.find(x=>x.id===l.pid);if(p){p.qty=+p.qty-l.qty;logStock(p,-l.qty,'invoice #'+i.num)}});save();viewInv(id)}
function invoicePrintHTML(id){const i=D.invoices.find(x=>x.id===id),t=itot(i),a=D.accounts.find(x=>x.id===i.accountId)||{};
 return{invoice:i,html:`<article class="invoice-sheet" style="font-family:Arial,sans-serif;color:#243449;background:#fff;padding:36px;width:100%;box-sizing:border-box"><div style="display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #345d80;padding-bottom:24px"><div><h1 style="margin:0 0 8px;font-size:26px;color:#1e3a56">${BIZ}</h1><div style="font-size:13px;color:#526579">Kiln-dried hardwood<br>Grand Rapids, MI</div></div><div style="text-align:right"><h2 style="margin:0;color:#345d80;font-size:20px">INVOICE</h2><div>#${i.num}</div><div>${i.date}</div><div>Due ${dueDate(i)}</div><b style="color:#345d80">${i.paid?'PAID':'DUE'}</b></div></div>
 <div style="padding:24px 0"><b style="color:#345d80">BILL TO</b><br>${esc(a.business)}${a.contact?'<br>'+esc(a.contact):''}${a.address?'<br>'+esc(a.address):''}${a.phone||a.email?'<br>'+esc([a.phone,a.email].filter(Boolean).join(' · ')):''}</div>
 <table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:#e8eef4;color:#1e3a56"><th style="text-align:left;padding:12px 8px">Item</th><th style="text-align:right;padding:12px 8px">Qty</th><th style="text-align:right;padding:12px 8px">Price</th><th style="text-align:right;padding:12px 8px">Amount</th></tr>
 ${i.lines.map(l=>`<tr><td style="padding:14px 8px;border-bottom:1px solid #dce4ec">${esc(l.name)}</td><td style="padding:14px 8px;text-align:right">${l.qty}</td><td style="padding:14px 8px;text-align:right">${money(l.price)}</td><td style="padding:14px 8px;text-align:right">${money(l.qty*l.price)}</td></tr>`).join('')}</table>
 <div style="margin:24px 0 0 auto;width:240px"><div style="display:flex;justify-content:space-between;padding:8px 0"><span>Subtotal</span><span>${money(t.s)}</span></div>${i.taxRate?`<div style="display:flex;justify-content:space-between;padding:8px 0"><span>Tax (${i.taxRate}%)</span><span>${money(t.tax)}</span></div>`:''}<div style="display:flex;justify-content:space-between;font-size:20px;border-top:2px solid #345d80;padding:12px 0;color:#1e3a56"><b>Total</b><b>${money(t.t)}</b></div></div>
 ${i.note?`<p style="font-size:13px;color:#526579;margin-top:28px">${esc(i.note)}</p>`:''}<p style="margin-top:36px;color:#345d80">Thank you for your business!</p></article>`}}
function printInv(id){$('#print').innerHTML=invoicePrintHTML(id).html;window.print()}
function saveInvPng(id){exportMenu('invoice:'+id);return runExport('invoice:'+id,'png')}

/* ---- Expenses ---- */
function vExp(){const y=String(new Date().getFullYear()),ytd=D.expenses.filter(e=>e.date.startsWith(y));const by={};ytd.forEach(e=>by[e.category]=(by[e.category]||0)+e.amount);
 return `<div class="between"><h2>Expenses</h2><button onclick="editExp()">+ Expense</button></div>
 <div class="card"><b>${y} year to date</b>${CATS.filter(c=>by[c]).map(c=>`<div class="between"><span>${c}</span><span>${money(by[c])}</span></div>`).join('')}<div class="between" style="border-top:1px solid #ccc;margin-top:4px"><b>Total</b><b>${money(ytd.reduce((t,e)=>t+e.amount,0))}</b></div>
 <button class="sec" style="width:100%;margin-top:8px" onclick="expCSV()">Export CSV for taxes</button></div>`+
 D.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<div class="card" onclick="editExp('${e.id}')"><div class="between"><b>${esc(e.vendor||e.category)}</b><b class="amount">${money(e.amount)}</b></div><div class="muted">${e.date} · ${e.category} · by ${esc(e.by)}${e.note?' · '+esc(e.note):''}</div></div>`).join('')}
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
function vSettings(){return `<h2>Settings</h2><div class="card"><b>Appearance</b><label for="theme">Color mode</label><select id="theme" onchange="setTheme(this.value)">${[['auto','Match device'],['light','Light'],['dark','Dark']].map(([k,l])=>`<option value="${k}" ${(localStorage.getItem('hf.theme')||'auto')===k?'selected':''}>${l}</option>`).join('')}</select></div><div class="card"><b>Working as</b><label for="operator">Record new activity under</label><select id="operator" onchange="localStorage.setItem('hf.operator',this.value);render()">${['Brandon','Billy'].map(n=>`<option ${me()===n?'selected':''}>${n}</option>`).join('')}</select><p class="muted">Data is local to this browser. Devices do not sync. Export a backup to transfer records.</p></div><div class="card"><b>Backup & restore</b><div class="muted">Last backup: ${D.lastBackup?new Date(D.lastBackup).toLocaleString():'never'}</div><div class="row" style="margin-top:12px"><button onclick="backup()">Export backup</button><button class="sec" onclick="$('#imp').click()">Import</button></div><input id="imp" type="file" accept=".json,application/json" style="display:none" onchange="importFile(this)"></div><div class="card"><b>Workspace data</b><p class="muted">These actions replace records on this browser only. Export a backup first.</p><button class="sec wide" onclick="resetData(true)">Reset to sample data</button><button class="bad wide" onclick="resetData(false)">Clear all data</button></div><div class="card"><b>Session lock</b><p class="muted">Test PIN: 1234. This is a device-only soft gate, not secure authentication or encryption.</p><button class="wide" onclick="Auth.signOut()">Lock app</button></div><p class="muted">Hopp Firewood · hf-v5</p>`}
function resetData(samples){if(!confirm(samples?'Replace ALL records with sample data? Export a backup first.':'Clear ALL business records on this browser? Export a backup first.'))return;D=samples?seed():emptyData();save()}
function backup(){D.lastBackup=Date.now();save();download('hopp-firewood-backup-'+today()+'.json',JSON.stringify({app:'hopp-firewood',version:1,exportedAt:new Date().toISOString(),data:D},null,2),'application/json')}
function importFile(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result),d=j.data||j;
 if(!['products','accounts','invoices','expenses','stockLog','projects','goals','events'].every(k=>d[k]===undefined||Array.isArray(d[k]))||!Array.isArray(d.products)||!Array.isArray(d.invoices))throw Error('Not a Hopp Firewood backup');
 if(confirm(`Replace ALL current data with this backup (${d.products.length} products, ${(d.accounts||[]).length} accounts, ${d.invoices.length} invoices, ${(d.expenses||[]).length} expenses)?`)){D=Object.assign(emptyData(),d);migrateData();save();alert('Imported')}}catch(e){alert('Import failed: '+e.message)}inp.value=''};r.readAsText(f)}
let backupAsked=false;
function maybeAskBackup(){if(backupAsked)return;backupAsked=true;if(D.lastBackup&&Date.now()-D.lastBackup<7*864e5)return;
 modal(`<h2>Save a backup now?</h2><p class="muted">${D.lastBackup?'Last backup was '+Math.floor((Date.now()-D.lastBackup)/864e5)+' days ago.':'You have never saved a backup.'}</p><div class="row"><button onclick="backup();closeModal()">Save</button><button class="sec" onclick="closeModal()">Later</button></div>`)}

function boot(){closeModal();render();scrollTo(0,0);if(Auth.currentUser()&&!D.sampleData&&(D.invoices.length||D.expenses.length))maybeAskBackup()}
migrateData();
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
