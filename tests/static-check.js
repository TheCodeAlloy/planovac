const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s+type="module")?>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]);

if (scripts.length !== 2) {
  throw new Error(`Očekávány 2 skripty, nalezeno ${scripts.length}.`);
}

new Function(scripts[0].replace(/^import .*;$/gm, ''));
new Function(scripts[1]);

for (const required of [
  'planner',
  'sync-status',
  'export-area',
]) {
  if (!html.includes(`id="${required}"`)) {
    throw new Error(`Chybí prvek #${required}.`);
  }
}

if (html.includes("CORRECT_PIN") || html.includes("const SESSION_KEY")) {
  throw new Error('Ve zdroji zůstalo původní klientské PIN zabezpečení.');
}

const backup = JSON.parse(
  fs.readFileSync('backups/events-2026-07-19-last-known.json', 'utf8'),
);

if (backup.length !== 23) {
  throw new Error(`Záloha má ${backup.length} událostí namísto očekávaných 23.`);
}

console.log('Statická kontrola proběhla úspěšně; záloha obsahuje 23 událostí.');
