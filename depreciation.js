'use strict';
// IRS Publication 946 (2025 edition, March 2026), Appendix A Table A-1, p.71.
// 3/5/7/10 years use GDS 200% DB; 15 years legally uses 150% DB, not 200%.
const MACRS_TABLES={3:[33.33,44.45,14.81,7.41],5:[20,32,19.2,11.52,11.52,5.76],7:[14.29,24.49,17.49,12.49,8.93,8.92,8.93,4.46],10:[10,18,14.4,11.52,9.22,7.37,6.55,6.55,6.56,6.55,3.28],15:[5,9.5,8.55,7.7,6.93,6.23,5.9,5.9,5.91,5.9,5.91,5.9,5.91,5.9,5.91,2.95]};
const DEPRECIATION_SOURCE='https://www.irs.gov/pub/irs-pdf/p946.pdf';
const DEP_METHODS={macrs:'MACRS GDS · half-year',straight:'Plain straight-line · daily planning',section179:'Section 179 · first-year expensing',bonus:'Bonus · eligible first-year allowance'};
const roundCash=n=>Math.round((+n||0)*100)/100;
function recoveryClass(a){return MACRS_TABLES[a.recoveryClass]?+a.recoveryClass:7}
function assetBusinessBasis(a){return n0(a.cost)*Math.min(100,a.businessUse===undefined?100:n0(a.businessUse))/100}
function regularDepSchedule(a,basis=n0(a.cost)){
 if(['Cash / bank','Inventory'].includes(a.type)||!a.date||!Number.isFinite(Date.parse(a.date+'T12:00:00')))return [];
 const year=+a.date.slice(0,4),method=a.depMethod||'macrs',rows=[];let left=basis;
 if(method==='straight'){
  if(!(a.life>0))return [];
  const life=Math.max(.1,n0(a.life)||7),salvage=Math.min(basis,n0(a.salvage)*(n0(a.cost)?basis/n0(a.cost):1)),annual=(basis-salvage)/life;
  for(let n=0;n<Math.ceil(life)+2&&left>salvage+.001;n++){const y=year+n,start=n===0?a.date:y+'-01-01',days=(Date.parse((y+1)+'-01-01T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/864e5,amount=Math.min(left-salvage,annual*days/365.25);left-=amount;rows.push({year:y,rate:amount/basis*100,amount,remaining:left})}
 }else{
  const rates=MACRS_TABLES[recoveryClass(a)];rates.forEach((rate,n)=>{const amount=n===rates.length-1?left:Math.min(left,roundCash(basis*rate/100));left=Math.max(0,left-amount);rows.push({year:year+n,rate,amount,remaining:left})});
 }
 return rows;
}
function depAt(a,date=today()){
 if(date<a.date||['Cash / bank','Inventory'].includes(a.type)||!Number.isFinite(Date.parse(a.date+'T12:00:00')))return 0;
 if(a.depMethod==='straight'){const basis=Math.max(0,n0(a.cost)-n0(a.salvage)),days=Math.max(0,(Date.parse(date+'T00:00:00Z')-Date.parse(a.date+'T00:00:00Z'))/864e5);return a.life>0?Math.min(basis,basis/a.life*days/365.25):0;}
 return sum(regularDepSchedule(a),r=>r.year<=+date.slice(0,4)?r.amount:0);
}
function assetRequestedDeduction(a,year,state=false){
 if(a.deductible===false||a.date>year+'-12-31'||['Cash / bank','Inventory'].includes(a.type))return 0;
 const basis=assetBusinessBasis(a),first=+a.date.slice(0,4)===+year,method=a.depMethod||'macrs',law=taxLaw();
 if(method==='section179')return first?basis:0;
 if(method==='bonus'){
  const rate=(state?(+a.date.slice(0,4)===2025?law.miBonusRate2025:law.miBonusRate):law.bonusRate)/100,regular=regularDepSchedule({...a,depMethod:'macrs'},basis*(1-rate)).find(r=>r.year===+year);
  return (first?basis*rate:0)+(regular?.amount||0);
 }
 return regularDepSchedule(a,basis).find(r=>r.year===+year)?.amount||0;
}
function depMethodFields(a,prefix='asset'){return `<label for="${prefix}Method">Depreciation method</label><select id="${prefix}Method">${Object.entries(DEP_METHODS).map(([k,v])=>`<option value="${k}" ${(a.depMethod||'macrs')===k?'selected':''}>${v}</option>`).join('')}</select><label for="${prefix}Class">MACRS recovery class</label><select id="${prefix}Class">${[3,5,7,10,15].map(n=>`<option value="${n}" ${recoveryClass(a)===n?'selected':''}>${n}-year${n===7?' · default':''}</option>`).join('')}</select><p class="muted">Hints only: light trucks, trailers, skid steers used in construction, and logging equipment commonly 5-year; general equipment/furniture commonly 7-year. Actual use/class controls—confirm with an accountant. Half-year assumed; mid-quarter may be required. 15-year uses 150% DB. Salvage affects plain SL only.</p><label for="${prefix}Business">Business use %</label><input id="${prefix}Business" type="number" min="0" max="100" value="${a.businessUse??100}">`}
function showAssetSchedule(id){const a=D.assets.find(a=>a.id===id);if(!a)return;modal(`<h2>${esc(a.name)}</h2><p class="muted">${DEP_METHODS[a.depMethod||'macrs']} · ${recoveryClass(a)}-year recovery · assumed half-year convention. Full write-offs affect tax, not the regular planning book value.</p>${scheduleHTML(a)}<p class="muted">Federal/MI columns show requested deductions before annual §179 limits. Confirm elections, eligibility, listed-property limits, business use, mid-quarter convention and carryovers with an accountant. Plain SL is a planning alternative, not a MACRS election calculation.</p><a href="${DEPRECIATION_SOURCE}" target="_blank" rel="noopener">IRS Pub 946 · Table A-1 p.71; class tables pp.98–101</a><button class="wide" onclick="exportMenu('asset:${id}')">Export depreciation schedule</button><button class="sec wide" onclick="closeModal()">Close</button>`)}
function scheduleRows(a){return regularDepSchedule(a).map(r=>[r.year,r.rate.toFixed(2)+'%',money(r.amount),money(assetRequestedDeduction(a,r.year)),money(assetRequestedDeduction(a,r.year,true)),money(r.remaining)])}
function scheduleHTML(a){return `<div class="table-scroll"><table><thead><tr>${['Year','Book rate','Book dep.','Federal requested','MI requested','Book value'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${scheduleRows(a).map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
