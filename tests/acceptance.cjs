const {chromium}=require('playwright');
const fs=require('fs');const assert=require('assert');
const out=process.env.ARTIFACT_DIR||'/workspace/firewood-v2';fs.mkdirSync(out,{recursive:true});
const url=process.env.TEST_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,acceptDownloads:true});
 const page=await context.newPage();const errors=[];const results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('dialog',d=>d.accept());
 const check=(v,msg)=>{assert(v,msg);results.push('PASS '+msg)};
 await page.goto(url);await page.screenshot({path:out+'/01-pin.png'});
 await page.keyboard.type('9999');check((await page.locator('#aerr').innerText()).includes('Incorrect PIN'),'Wrong PIN rejected');
 check(!(await page.locator('#nav').isVisible()),'Tabs hidden while locked');
 for(const n of ['1','2','3','4'])await page.getByRole('button',{name:n,exact:true}).click();await page.getByRole('heading',{name:'Ready for the next delivery.'}).waitFor();
 await page.evaluate(()=>scrollTo(0,0));
 check(await page.locator('.delivery').count()===3,'Dashboard renders three pending sample orders/deliveries');
 await page.screenshot({path:out+'/02-dashboard.png'});
 const before=await page.evaluate(()=>localStorage.getItem('hf.data.v1'));
 for(const [label,heading,text] of [['Stock','Inventory','Stock history'],['Clients','Accounts','New Holland Knickerbocker'],['Invoices','Invoices','unpaid'],['Costs','Expenses','Delivery fuel (Sample)'],['Settings','Settings','Reset to sample data']]){
  await page.getByRole('navigation').getByRole('button',{name:label,exact:true}).click();
  await page.getByRole('heading',{name:heading,exact:true}).waitFor();
  check((await page.locator('#app').innerText()).includes(text),label+' tab renders sample content');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' has no horizontal overflow');
 }
 check(await page.locator('nav svg').count()===6,'Six inline SVG navigation icons');
 await page.getByRole('navigation').getByRole('button',{name:'Stock',exact:true}).click();
 check(await page.locator('.stock-adjust').first().evaluate(el=>el.children[1].getBoundingClientRect().width>150),'Inventory quantities have readable width');
 await page.screenshot({path:out+'/03-stock-navigation.png'});
 await page.getByRole('navigation').getByRole('button',{name:'Invoices',exact:true}).click();
 check(await page.locator('.tag.paid').count()===1&&await page.locator('.tag.unpaid').count()===4,'Paid and unpaid invoice samples');
 await page.locator('#app .card').first().click();await page.screenshot({path:out+'/04-invoice.png'});
 const dlPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Save as PNG',exact:true}).click();const dl=await dlPromise;
 await dl.saveAs(out+'/'+dl.suggestedFilename());check(dl.suggestedFilename()==='invoice-1005.png','Invoice PNG exported successfully');
 await page.locator('#mbody .between button').first().click();await page.reload();
 check(await page.getByRole('heading',{name:'Ready for the next delivery.'}).isVisible(),'Session unlock survives reload');
 check(await page.evaluate(()=>localStorage.getItem('hf.data.v1'))===before,'Existing records not reseeded on reload');
 await page.getByRole('button',{name:'Lock app',exact:true}).click();check(await page.getByRole('heading',{name:'Welcome back'}).isVisible(),'Lock app restores PIN gate');
 await page.keyboard.type('1234');await page.getByRole('navigation').getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByRole('button',{name:'Clear all data',exact:true}).click();check(await page.evaluate(()=>JSON.parse(localStorage.getItem('hf.data.v1')).invoices.length)===0,'Clear all data empties records');
 await page.reload();check(await page.evaluate(()=>JSON.parse(localStorage.getItem('hf.data.v1')).products.length)===0,'Cleared dataset stays empty on reload');
 // Dismiss the optional backup reminder for a deliberately empty workspace.
 if(await page.getByRole('button',{name:'Later',exact:true}).isVisible())await page.getByRole('button',{name:'Later',exact:true}).click();
 await page.getByRole('navigation').getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Reset to sample data',exact:true}).click();
 check(await page.evaluate(()=>JSON.parse(localStorage.getItem('hf.data.v1')).invoices.length)===5,'Reset to sample data repopulates all records');
 await page.locator('#operator').selectOption('Billy');check(await page.evaluate(()=>Auth.currentUser())==='Billy','Operator attribution switches to Billy');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});check(await page.evaluate(async()=> (await caches.keys()).includes('hf-v3')),'Service worker caches hf-v3');
 // Real interactions: stock, invoice fulfillment/payment, expenses, backup.
 await page.getByRole('navigation').getByRole('button',{name:'Stock',exact:true}).click();
 await page.locator('.stock-adjust').first().getByRole('button',{name:'+',exact:true}).click();
 check(await page.evaluate(()=>D.products[0].qty)===121,'Stock adjustment saves quantity and history');
 await page.getByRole('navigation').getByRole('button',{name:'Invoices',exact:true}).click();await page.locator('#app .card').first().click();
 await page.getByRole('button',{name:'Mark delivered',exact:true}).click();check(await page.evaluate(()=>D.products.find(p=>p.id==='pizza').qty)===40,'Delivery deducts invoice quantities from stock');
 await page.getByRole('button',{name:'Mark paid',exact:true}).click();check(await page.evaluate(()=>D.invoices.find(i=>i.num===1005).paid),'Invoice payment status persists');
 await page.locator('#mbody .between button').first().click();await page.getByRole('navigation').getByRole('button',{name:'Costs',exact:true}).click();await page.getByRole('button',{name:'+ Expense',exact:true}).click();
 await page.locator('#ea').fill('12.50');await page.locator('#ev').fill('Acceptance test');await page.getByRole('button',{name:'Save',exact:true}).click();
 check(await page.evaluate(()=>D.expenses.some(e=>e.vendor==='Acceptance test'&&e.amount===12.5&&e.by==='Billy')),'New expense saves with correct operator');
 await page.getByRole('navigation').getByRole('button',{name:'Settings',exact:true}).click();const backupPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();const backup=await backupPromise;await backup.saveAs(out+'/acceptance-backup.json');
 check(JSON.parse(fs.readFileSync(out+'/acceptance-backup.json','utf8')).data.expenses.length===4,'Backup exports complete workspace');
 await context.setOffline(true);await page.reload();check(await page.getByRole('heading',{name:'Ready for the next delivery.'}).isVisible(),'PWA reloads offline from hf-v3 cache');await context.setOffline(false);
 const fresh=await browser.newContext({viewport:{width:390,height:844}});const p2=await fresh.newPage();p2.on('pageerror',e=>errors.push(e.message));p2.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p2.goto(url);check(await p2.getByRole('heading',{name:'Welcome back'}).isVisible(),'New browser session requires PIN');
 // Simulate pre-update saved business records; do not overwrite them with samples.
 await p2.evaluate(()=>{const d=JSON.parse(localStorage.getItem('hf.data.v1'));d.sampleData=false;d.accounts=[{id:'real',business:'Existing saved customer'}];d.invoices=[];localStorage.setItem('hf.data.v1',JSON.stringify(d))});await p2.reload();await p2.keyboard.type('1234');if(await p2.getByRole('button',{name:'Later',exact:true}).isVisible())await p2.getByRole('button',{name:'Later',exact:true}).click();
 check(await p2.evaluate(()=>JSON.parse(localStorage.getItem('hf.data.v1')).accounts[0].business)==='Existing saved customer','Pre-update saved business records preserved');
 check(errors.length===0,'No console errors or uncaught exceptions: '+JSON.stringify(errors));
 fs.writeFileSync(out+'/test-results.txt',results.join('\n')+'\n');console.log(results.join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
