import { spawn } from 'child_process';
import http from 'http';
import os from 'os';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.join(os.tmpdir(), 'axiom_chrome_test_profile_' + Date.now());
fs.mkdirSync(profileDir, { recursive: true });

console.log('Launching Chrome from:', CHROME_PATH);
const chrome = spawn(CHROME_PATH, [
  '--remote-debugging-port=9222',
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${profileDir}`,
  'about:blank'
], { stdio: 'ignore' });

async function checkCDP() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const json = await res.json();
        console.log('✅ Chrome CDP is ready! Browser:', json.Browser);
        console.log('WebSocket Debugger URL:', json.webSocketDebuggerUrl);
        return json;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error('Chrome CDP failed to respond on port 9222.');
}

checkCDP().then(async (version) => {
  console.log('CDP Test Successful!');
  chrome.kill();
}).catch(err => {
  console.error('CDP Error:', err.message);
  chrome.kill();
});
