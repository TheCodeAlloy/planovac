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
  'f-visibility',
  'visibility-users',
  'trash-overlay',
  'users-overlay',
  'categories-overlay',
  'list-view',
]) {
  if (!html.includes(`id="${required}"`)) {
    throw new Error(`Chybí prvek #${required}.`);
  }
}

for (const feature of [
  "collection(db,'users',user.uid,'privateEvents')",
  "collection(db,'restrictedEvents')",
  "collection(db,'categories')",
  "collection(db,'authorizedUsers')",
  "window._dbTrash",
  "window._dbRestore",
  "window._approveUser",
  "function contrastText(bg)",
  "function categorySymbol(catId",
  "birthday:['🎂','🌸']",
  "emoji: '🏛️'",
]) {
  if (!html.includes(feature)) throw new Error(`Chybí implementace: ${feature}`);
}

if (html.includes("icon.textContent='★'")) {
  throw new Error('Obecná událost stále používá hvězdičku místo malé tečky.');
}

if (/\.cell-category-icon\s*\{[^}]*background\s*:\s*rgba\(255,255,255/i.test(html)) {
  throw new Error('Ikony kategorií stále používají bílý kruhový podklad.');
}

if (html.includes('.cz-flag')) {
  throw new Error('Ve zdroji zůstala původní výrazná česká vlajka.');
}

const rules = fs.readFileSync('firestore.rules', 'utf8');
for (const protectedPath of [
  'privateEvents',
  'restrictedEvents',
  'authorizedUsers',
  'accessRequests',
  'userSettings',
  'categories',
]) {
  if (!rules.includes(protectedPath)) throw new Error(`Pravidla neobsahují ${protectedPath}.`);
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
