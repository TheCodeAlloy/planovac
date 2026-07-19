# Roční plánovač

Jednostránkový plánovač používající Firebase Authentication a Cloud Firestore.

Podrobný popis funkcí, dat, zabezpečení, připomínek a správy je v
[`POPIS_APLIKACE.md`](POPIS_APLIKACE.md). Prostá textová verze je v
[`POPIS_APLIKACE.txt`](POPIS_APLIKACE.txt).

## Bezpečné uvedení změn do provozu

1. V konzoli Firebase otevřete **Authentication → Sign-in method** a zapněte poskytovatele **Google**.
2. V **Authentication → Settings → Authorized domains** přidejte `thecodealloy.github.io`, pokud tam ještě není.
3. Po prvním přihlášení získejte v **Authentication → Users** UID oprávněného účtu.
4. Ve Firestore vytvořte kolekci `authorizedUsers`. Pro každého povoleného uživatele vytvořte dokument, jehož ID je přesně jeho Firebase UID. Volitelná pole, například `email` a `name`, slouží jen pro orientaci správce.
5. Zkontrolujte aktuální kolekci `events` a před změnou pravidel vytvořte export Firestore. Lokální poslední známá záloha je popsána v `backups/README.md`; její JSON je ignorovaný Gitem.
6. Nasaďte nové `firestore.rules` do projektu `rocni-planovac`. Stará verze aplikace bude v krátkém přechodném období umět data číst, ale nemusí umět zapisovat.
7. Bezprostředně potom nasaďte aktualizovaný `index.html` na GitHub Pages a ověřte načtení i uložení jedné testovací události.

## Přidání dalšího uživatele

1. Uživatel na stránce zvolí **Přihlásit přes Google**.
2. Aplikace vytvoří dokument v `accessRequests` a zobrazí informaci, že účet čeká na schválení.
3. Administrátor otevře v plánovači **Uživatelé** a žádost schválí.
4. Uživatel obnoví stránku a získá přístup. Administrátor může později změnit jeho roli na člena nebo administrátora.

Odebrání přístupu se provede v okně **Uživatelé**. Události uživatele se tím nemažou.

Stávající dokumenty v kolekci `events` se nemigrují ani nemažou. Nová pravidla pouze vyžadují přihlášení a kontrolují formát budoucích zápisů.

Rozšířená verze používá také kolekce `restrictedEvents`, `categories`,
`userSettings`, `accessRequests` a soukromou cestu
`users/{uid}/privateEvents`. Nová pravidla a nový `index.html` je potřeba
nasadit těsně po sobě; nejbezpečnější je nejdřív publikovat pravidla a potom
okamžitě aplikaci.

## Lokální spuštění

Soubor je potřeba obsloužit přes HTTP, například:

```powershell
python -m http.server 8000
```

Poté otevřete `http://localhost:8000/`.

## Ochrana dat

- Nikdy necommitujte soubory `backups/*.json`.
- Import upozorní na shodná ID, která by byla přepsána.
- Mazání vyžaduje potvrzení.
- Nasazení pravidel ani aplikace samo o sobě nemaže žádné dokumenty.
