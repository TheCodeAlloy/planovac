const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s+type="module")?>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]);

if (scripts.length !== 2) {
  throw new Error(`Očekávány 2 skripty, nalezeno ${scripts.length}.`);
}

new Function(scripts[0].replace(/^import .*;$/gm, ''));
new Function(scripts[1]);

const allScriptCode = scripts.join('\n');
const inlineHandlers = [...html.matchAll(/\bon(?:click|change|input|mousedown|keydown)="([^"]+)"/g)]
  .flatMap(match => [...match[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(call => call[1]));
for (const handler of new Set(inlineHandlers)) {
  if (!allScriptCode.includes(`function ${handler}(`) && !allScriptCode.includes(`window.${handler} =`)) {
    throw new Error(`Inline ovladač volá chybějící funkci ${handler}().`);
  }
}

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
  'top-menu',
  'top-menu-btn',
  'invite-email',
  'invite-controls',
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
  "window._inviteUser",
  "window._removeInvite",
  "collection(db,'userInvites')",
  "function toggleTopMenu()",
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

if (!html.includes('📆 Příštích 7 dní') || !html.includes('☰ Menu')) {
  throw new Error('Horní lišta neobsahuje přehled sedmi dnů a nové Menu.');
}

const rules = fs.readFileSync('firestore.rules', 'utf8');
for (const protectedPath of [
  'privateEvents',
  'restrictedEvents',
  'authorizedUsers',
  'accessRequests',
  'userSettings',
  'categories',
  'userInvites',
]) {
  if (!rules.includes(protectedPath)) throw new Error(`Pravidla neobsahují ${protectedPath}.`);
}

for (const inviteProtection of [
  'function verifiedEmail()',
  'request.auth.token.email == email',
  'request.resource.data.email == request.auth.token.email',
  'request.resource.data.role == get(/databases/$(database)/documents/userInvites/',
]) {
  if (!rules.includes(inviteProtection)) throw new Error(`Pozvánky nemají kontrolu: ${inviteProtection}`);
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
