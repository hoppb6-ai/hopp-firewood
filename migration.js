'use strict';
/* v5.1 deliberately removes known historical seed identities even if edited.
 * Per-record flags, exact IDs and known seeded names establish provenance;
 * the old global sampleData bit never means “delete every record”. */
function legacySampleCandidates(d){
 const known={products:['wood','pizza','smoker'],accounts:['nh','sample-pizza','sample-bbq','sample-home'],expenses:['fuel','bags','supplies']};
 const names=new Set(['New Holland Knickerbocker','Riverbend Pizza Co. (Sample)','Lakeshore Smokehouse (Sample)','Maple Grove Campground (Sample)','Delivery fuel (Sample)','Wood bags & labels (Sample)','Winter delivery readiness (Sample)','Knickerbocker standing route (Sample)'].map(x=>x.toLowerCase()));
 const ids={};for(const k of DATA_LISTS){ids[k]=new Set();for(const r of d[k]||[]){const id=String(r.id||''),label=String(r.business||r.name||r.title||r.vendor||'').trim().toLowerCase(),flag=r.sample===true||r.sampleData===true||r.seededSample===true||r.isSample===true;
  if(id.startsWith('demo-v51-')||r.demoVersion===DEMO_VERSION)continue;
  if(flag||id.startsWith('sample-')||(known[k]||[]).includes(id)||names.has(label)||/\(sample\)\s*$/i.test(label)||(r.demo===true&&r.demoVersion!==DEMO_VERSION))ids[k].add(r.id);
 }
 }
 for(const r of d.stockLog||[])if(ids.products.has(r.pid)||r.reason==='Sample opening stock'||r.seededSample===true)ids.stockLog.add(r.id||r);
 return ids;
}
function normalizeWoodCopy(value){
 if(typeof value==='string'&&!value.startsWith('data:image/'))return value.replace(/ki[l]n(?:[-\s]+dried)?(?:\s+hardwood|\s+firewood)?/gi,'Seasoned hardwood');
 if(Array.isArray(value))return value.map(normalizeWoodCopy);
 if(value&&typeof value==='object')for(const key of Object.keys(value))value[key]=normalizeWoodCopy(value[key]);
 return value;
}
function migrateData(){
 const original=JSON.stringify(D);try{
  for(const k of DATA_LISTS)if(!Array.isArray(D[k]))D[k]=[];
  D.financeSettings=Object.assign(financeDefaults(),D.financeSettings||{});
  if(!D.demoInitializedV51){
   const ids=legacySampleCandidates(D);let removed=0;
   const removedIds=new Set(Object.values(ids).flatMap(s=>[...s]).filter(x=>typeof x==='string'));
   for(const r of D.activity)if(removedIds.has(r.recordId))ids.activity.add(r.id);
   for(const k of DATA_LISTS){const before=D[k].length;D[k]=D[k].filter(r=>!ids[k].has(r.id)&&!ids[k].has(r));removed+=before-D[k].length;}
   if(removed&&!localStorage.getItem('hf.pre-v7-recovery'))localStorage.setItem('hf.pre-v7-recovery',original);
   removeDemoRecords();appendDemoData();D.cleanupNotice=(removed?`Removed ${removed} old demonstration records, including edited seeds. A pre-update recovery backup is in Settings. `:'')+'Loaded fictional kitchen demo activity for Nov 2025–Nov 2026. Your own records were kept. Settings lets you remove or reload the demo; nothing syncs between phones.';
  }
  normalizeWoodCopy(D);D.sampleData=false;D.legacyCleanedV6=true;D.schemaVersion=8;
  if(!D.projects.some(p=>p.id===D.currentProjectId))D.currentProjectId=(D.projects.find(p=>!p.complete)||{}).id||null;
  initializeTaxV52();Storage.save(D);
 }catch(e){D=JSON.parse(original);for(const k of DATA_LISTS)if(!Array.isArray(D[k]))D[k]=[];D.financeSettings=Object.assign(financeDefaults(),D.financeSettings||{});initializeTaxV52();D.cleanupNotice='Update data could not be saved on this device. Export a JSON backup, free browser storage, and reopen online. No original records were removed.';}
}
