import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const origin=process.env.PERF_ORIGIN||'http://127.0.0.1:3000';
const browser=await chromium.launch();
const results=[];
try {
 for(const path of ['/','/undangan','/admin']) {
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{
   window.__perf={lcp:0,cls:0,longTaskMs:0};
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__perf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__perf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__perf.longTaskMs+=Math.max(0,e.duration-50);}).observe({type:'longtask',buffered:true});
  });
  await page.goto(origin+path,{waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  results.push(await page.evaluate(path=>{
   const nav=performance.getEntriesByType('navigation')[0];
   const resources=performance.getEntriesByType('resource');
   return {path,...window.__perf,ttfb:nav.responseStart-nav.requestStart,domReady:nav.domContentLoadedEventEnd,transferBytes:resources.reduce((s,e)=>s+e.transferSize,nav.transferSize),requests:resources.length,largestResources:resources.map(e=>({path:new URL(e.name).pathname,bytes:e.transferSize})).sort((a,b)=>b.bytes-a.bytes).slice(0,5)};
  },path));
  await context.close();
 }
 await mkdir('test-results',{recursive:true});
 await writeFile('test-results/performance.json',JSON.stringify({profile:'390px, 4x CPU slowdown, 1.6 Mbps download, 150ms latency, cold browser cache; single lab run, not field Web Vitals',origin,results},null,2));
 console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
