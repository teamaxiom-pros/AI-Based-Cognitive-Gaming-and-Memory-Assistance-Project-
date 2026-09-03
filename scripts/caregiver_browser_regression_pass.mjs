import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.join(os.tmpdir(), 'axiom_chrome_caregiver_' + Date.now());
fs.mkdirSync(profileDir, { recursive: true });

console.log('🚀 Launching Real Chrome for Regression Pass 2 (Caregiver & Advanced Clinical Reports)...');
const chrome = spawn(CHROME_PATH, [
  '--remote-debugging-port=9223',
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${profileDir}`,
  'about:blank'
], { stdio: 'ignore' });

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        } else if (msg.method) {
          const listeners = this.eventListeners.get(msg.method) || [];
          listeners.forEach(fn => fn(msg.params));
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, fn) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(fn);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runRegressionPass2() {
  let versionInfo = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9223/json/version');
      if (res.ok) {
        versionInfo = await res.json();
        break;
      }
    } catch {
      await sleep(400);
    }
  }

  let listRes = await fetch('http://127.0.0.1:9223/json/list');
  let targets = await listRes.json();
  let target = targets.find(t => t.type === 'page');

  if (!target) {
    const putRes = await fetch('http://127.0.0.1:9223/json/new?http://localhost:5173/caregiver/dashboard', { method: 'PUT' });
    target = await putRes.json();
  }

  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  const consoleErrors = [];
  const uncaughtExceptions = [];

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  cdp.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      const text = params.args.map(a => a.value || a.description || '').join(' ');
      consoleErrors.push(text);
      console.error(`🔴 [Console Error]:`, text);
    }
  });

  cdp.on('Runtime.exceptionThrown', (params) => {
    const text = params.exceptionDetails.text + ' ' + (params.exceptionDetails.exception?.description || '');
    uncaughtExceptions.push(text);
    console.error(`💥 [Uncaught Exception]:`, text);
  });

  async function evaluate(expression) {
    const res = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + ': ' + (res.exceptionDetails.exception?.description || ''));
    }
    return res.result?.value;
  }

  console.log('\n================================================================');
  console.log('       AXIOM REGRESSION PASS 2 — CAREGIVER CLINICAL PORTAL      ');
  console.log('================================================================\n');

  // Test 1: Caregiver Dashboard
  console.log('▶ [TEST 1] Caregiver Dashboard & Patient Profile Card...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/caregiver/dashboard' });
  await sleep(1500);

  const caregiverH1 = await evaluate('document.querySelector("h1")?.innerText');
  const activePatientTag = await evaluate('document.querySelector(".text-emerald-800")?.innerText');
  const statCards = await evaluate('Array.from(document.querySelectorAll(".text-3xl")).map(el => el.innerText)');
  console.log(`   Dashboard Heading: "${caregiverH1}" (${activePatientTag})`);
  console.log(`   Vital Metric Tiles: ${statCards.join(' | ')}`);

  // Test 2: Cognitive Analytics & Domain Breakdown
  console.log('\n▶ [TEST 2] Cognitive Analytics & Assessment Sessions...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/caregiver/cognition' });
  await sleep(1200);

  const cognitionH1 = await evaluate('document.querySelector("h1")?.innerText');
  const overallBadge = await evaluate('document.querySelector(".bg-teal-100")?.innerText');
  const domainCards = await evaluate('Array.from(document.querySelectorAll(".text-3xl")).map(el => el.innerText)');
  console.log(`   Analytics Heading: "${cognitionH1}"`);
  console.log(`   Activity Score Badge: "${overallBadge}"`);
  console.log(`   Domain Calculated Scores: ${domainCards.join(' | ')}`);

  // Test 3: Activity History & Logs
  console.log('\n▶ [TEST 3] Real Activity History Log Table...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/caregiver/activities' });
  await sleep(1000);

  const activitiesH1 = await evaluate('document.querySelector("h1")?.innerText');
  const sessionRowsCount = await evaluate('document.querySelectorAll("tbody tr").length');
  console.log(`   Activity History Heading: "${activitiesH1}"`);
  console.log(`   Total Logged Activity Sessions: ${sessionRowsCount} rows`);

  // Test 4: Clinical Report Generator & Live Preview
  console.log('\n▶ [TEST 4] Clinical Report Generator & Print/Export Layout...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/caregiver/reports' });
  await sleep(1200);

  const reportsH1 = await evaluate('document.querySelector("h1")?.innerText');
  const reportPatientName = await evaluate('document.querySelector(".font-bold.text-slate-900")?.innerText');
  const exportCsvBtn = await evaluate('Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("CSV"))?.innerText');
  const printPdfBtn = await evaluate('Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Print") || b.innerText.includes("PDF"))?.innerText');

  console.log(`   Report Generator Heading: "${reportsH1}"`);
  console.log(`   Target Patient: "${reportPatientName}"`);
  console.log(`   Export Buttons: [${exportCsvBtn}] [${printPdfBtn}]`);

  // Test CSV export button click in real browser
  const csvClicked = await evaluate(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CSV'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  console.log(`   CSV Export Button Triggered: ${csvClicked}`);
  await sleep(800);

  // Check audit results
  console.log('\n================================================================');
  console.log('              REGRESSION PASS 2 AUDIT RESULTS                   ');
  console.log('================================================================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Uncaught Exceptions: ${uncaughtExceptions.length}`);

  if (consoleErrors.length === 0 && uncaughtExceptions.length === 0) {
    console.log('✅ REGRESSION PASS 2 PASSED WITH ZERO DEFECTS!');
  } else {
    throw new Error('Regression Pass 2 encountered console errors.');
  }

  cdp.close();
  chrome.kill();
}

runRegressionPass2().catch(err => {
  console.error('\n❌ Regression Pass 2 Error:', err.message);
  chrome.kill();
  process.exit(1);
});
