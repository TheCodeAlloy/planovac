# Roční plánovač – popis aplikace a správy

## K čemu aplikace slouží

Roční plánovač zobrazuje dvanáct po sobě jdoucích měsíců v jedné tabulce. Uživatelé mohou vytvářet jednodenní i vícedenní události, opakovat je každý rok, filtrovat kategorie, události upravovat, kopírovat, přesouvat a exportovat.

Veřejná adresa aplikace je:

<https://thecodealloy.github.io/planovac/>

Webová stránka je veřejně dostupná, ale soukromé události může z databáze načíst nebo změnit pouze přihlášený a schválený uživatel.

## Použité technologie

- **GitHub** – uchovává zdrojový kód.
- **GitHub Pages** – zveřejňuje statický soubor `index.html`.
- **Firebase Authentication** – přihlašuje uživatele jejich Google účtem.
- **Cloud Firestore** – ukládá a synchronizuje společné události v reálném čase.
- **Firestore Security Rules** – povolují práci s událostmi pouze uživatelům uvedeným v `authorizedUsers`.
- **Local Storage** – uchovává pouze místní nastavení tmavého režimu; není hlavním úložištěm událostí.

Firebase projekt se jmenuje `rocni-planovac`. Konfigurace Firebase uvedená ve webovém kódu není heslo. Přístup k datům chrání přihlášení a pravidla Firestore.

## Přihlášení a oprávnění

Uživatel se přihlásí tlačítkem **Přihlásit přes Google**. Firebase si přihlášení v daném prohlížeči obvykle pamatuje.

Přihlášení samo o sobě přístup k událostem nestačí. UID uživatele musí existovat jako ID dokumentu v této kolekci:

```text
authorizedUsers/{firebaseUid}
```

Dokument může pro orientaci obsahovat například:

```text
role: "admin"
```

nebo:

```text
role: "member"
```

Role je nyní pouze popisná. Pravidla rozlišují, zda dokument existuje, nikoliv hodnotu role.

### Přidání uživatele

1. Uživatel se jednou pokusí přihlásit do plánovače svým Google účtem.
2. Jeho účet se objeví ve **Firebase Console → Authentication → Users**.
3. Správce zkopíruje jeho UID.
4. Ve **Firestore → Data → authorizedUsers** vytvoří dokument, jehož Document ID je přesně toto UID.
5. Přidá pole `role` typu string s hodnotou `member`.
6. Uživatel obnoví stránku plánovače.

### Odebrání uživatele

Ve Firestore se smaže pouze jeho dokument z `authorizedUsers`. Jeho účet může zůstat v Authentication. Události se odebráním oprávnění nemažou.

## Datový model

Události jsou společné pro všechny schválené uživatele a ukládají se do kolekce `events`.

Každý dokument události používá tato pole:

| Pole | Význam |
|---|---|
| `id` | ID události, shodné s ID dokumentu a začínající `u_` |
| `name` | Název události |
| `dateFrom` | Počáteční datum ve formátu `RRRR-MM-DD` |
| `dateTo` | Koncové datum nebo `null` |
| `cat` | Kategorie: `holiday`, `birthday`, `vacation`, `event`, `eras` |
| `note` | Poznámka nebo `null` |
| `repeat` | `none` nebo `yearly` |

České státní svátky a pohyblivé velikonoční svátky jsou zabudované přímo v kódu a do Firestore se neukládají.

## Jak funguje přehled „Příštích 7 dní“

Tlačítko **Příštích 7 dní** neznamená individuálně nastavené upozornění.

Současná funkce:

- vyhledá všechny události v následujících sedmi dnech,
- zobrazí je v jednom přehledu,
- zahrne i vestavěné svátky,
- nezahrne dnešní události, pouze období od zítřka do sedmi dnů,
- respektuje právě vypnuté kategorie, takže skrytá kategorie se nezobrazí ani v připomínkách,
- funguje pouze po otevření aplikace a kliknutí na tlačítko,
- neposílá e-mail, push oznámení ani systémovou notifikaci,
- nemá u události volbu „připomenout předem“.

Proto může okno hlásit, že žádné připomínky nejsou, i když jsou v kalendáři události později než za sedm dnů.

## Doporučené rozšíření připomínek

### Varianta 1 – připomínky uvnitř aplikace (doporučený první krok)

Do události přidat například:

- přepínač **Připomenout**,
- volbu **v den události / 1 den / 3 dny / 7 dní předem**,
- volitelně čas připomenutí.

Po otevření plánovače by aplikace zobrazila aktivní připomínky a počet nových upozornění. Tato varianta je jednoduchá, nevyžaduje placenou serverovou službu, ale neupozorní uživatele, když je web zavřený.

### Varianta 2 – skutečná oznámení i při zavřené stránce

Vyžaduje:

- povolení oznámení v prohlížeči,
- service worker,
- registraci zařízení nebo prohlížeče,
- Firebase Cloud Messaging,
- serverové nebo plánované zpracování, například Cloud Functions nebo Cloud Scheduler.

Tato varianta je technicky náročnější, může vyžadovat placený tarif Firebase a musí řešit časová pásma, více zařízení, odvolání souhlasu a ochranu push tokenů.

## Export, import a zálohy

- **JSON export** obsahuje vlastní události a slouží jako nejjednodušší přenosná záloha.
- **JSON import** kontroluje formát dat a upozorňuje na dokumenty se shodným ID.
- **ICS export** vytváří soubor pro kalendářové aplikace a zachovává každoroční opakování.
- Poslední známá lokální záloha 23 událostí je uložena v `backups/events-2026-07-19-last-known.json`.
- JSON zálohy jsou uvedené v `.gitignore`, aby osobní údaje nebyly omylem odeslány na veřejný GitHub.

Doporučení: pravidelně provést JSON export, zejména před úpravou pravidel Firestore, hromadným importem nebo větší změnou aplikace.

## Bezpečnost

- Webová stránka a její zdrojový kód jsou veřejné.
- Soukromé události chrání Firebase Authentication a `firestore.rules`.
- Přístup má pouze Google účet uvedený v `authorizedUsers`.
- Aplikace nevkládá uživatelský text nebezpečně pomocí `innerHTML`.
- Mazání události vyžaduje potvrzení.
- Import omezuje povolená pole, kategorie, délky a formát data.
- Osobní zálohy se nesmějí commitovat ani odesílat na GitHub.

## Doporučené další úpravy

1. **Nastavitelné připomínky uvnitř aplikace** – největší chybějící uživatelská funkce.
2. **Jasná obrazovka „Přístup nebyl schválen“** – nyní se přihlášený, ale nepovolený uživatel dozví o problému hlavně ze stavu synchronizace.
3. **Správa uživatelů přímo v aplikaci** – pouze pro administrátora; nyní se UID přidává ručně ve Firebase Console.
4. **Historie změn** – doplnit `createdAt`, `updatedAt`, `createdBy` a `updatedBy`, aby bylo zřejmé, kdo událost změnil.
5. **Koš nebo archiv** – místo okamžitého definitivního smazání umožnit obnovu.
6. **Automatické zálohy** – pravidelný export Firestore mimo veřejný repozitář.
7. **Rozdělení `index.html`** – oddělit HTML, CSS a JavaScript pro snazší údržbu a testování.
8. **Automatické testy** – testovat opakované a vícedenní události, import, ICS a oprávnění Firestore.
9. **Lepší mobilní režim** – nabídnout měsíční nebo seznamové zobrazení; tabulka dvanácti měsíců vyžaduje na telefonu vodorovný posun.
10. **Firebase App Check** – další omezení automatizovaného zneužívání; nenahrazuje přihlášení ani bezpečnostní pravidla.

## Důležité soubory

| Soubor | Účel |
|---|---|
| `index.html` | Celá webová aplikace |
| `firestore.rules` | Pravidla přístupu k Firestore |
| `README.md` | Stručný technický postup nasazení a správy uživatelů |
| `POPIS_APLIKACE.md` | Tento podrobný popis |
| `POPIS_APLIKACE.txt` | Stejný popis ve formátu prostého textu |
| `backups/README.md` | Informace o lokální záloze |
| `tests/static-check.js` | Základní statická kontrola aplikace a zálohy |

## Bezpečný postup při budoucích změnách

1. Nejdříve vytvořit zálohu událostí.
2. Změny připravit a otestovat lokálně.
3. Zkontrolovat `git status`, aby nebyla zahrnuta JSON záloha.
4. Commitnout pouze zdrojové a dokumentační soubory.
5. Pushnout na GitHub až po schválení vlastníka.
6. Po nasazení ověřit přihlášení, stav `online`, načtení událostí a jeden testovací zápis.
7. Pravidla Firestore měnit až po vytvoření potřebných dokumentů v `authorizedUsers`.
