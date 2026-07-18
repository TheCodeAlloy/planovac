# Roční plánovač

Jednostránkový plánovač používající Firebase Authentication a Cloud Firestore.

## Bezpečné uvedení změn do provozu

1. V konzoli Firebase otevřete **Authentication → Sign-in method** a zapněte poskytovatele **Google**.
2. V **Authentication → Settings → Authorized domains** přidejte `thecodealloy.github.io`, pokud tam ještě není.
3. Po prvním přihlášení získejte v **Authentication → Users** UID oprávněného účtu.
4. Ve Firestore vytvořte kolekci `authorizedUsers`. Pro každého povoleného uživatele vytvořte dokument, jehož ID je přesně jeho Firebase UID. Volitelná pole, například `email` a `name`, slouží jen pro orientaci správce.
5. Zkontrolujte aktuální kolekci `events` a před změnou pravidel vytvořte export Firestore. Lokální poslední známá záloha je popsána v `backups/README.md`; její JSON je ignorovaný Gitem.
6. Nasaďte aktualizovaný `index.html` na GitHub Pages a jednou se přihlaste požadovaným Google účtem.
7. Bezprostředně potom nasaďte `firestore.rules` do projektu `rocni-planovac` a znovu ověřte načtení i uložení jedné testovací události.

## Přidání dalšího uživatele

1. Uživatel na stránce zvolí **Přihlásit přes Google**. Při prvním pokusu se jeho účet objeví ve **Firebase Authentication → Users**, i když ještě nemá přístup k událostem.
2. Správce zkopíruje jeho UID.
3. Ve **Firestore → Data → authorizedUsers** vytvoří dokument s tímto UID jako Document ID.
4. Uživatel obnoví stránku a získá přístup ke společnému plánovači.

Odebrání přístupu se provede smazáním příslušného dokumentu z `authorizedUsers`; události uživatele se tím nemažou.

Stávající dokumenty v kolekci `events` se nemigrují ani nemažou. Nová pravidla pouze vyžadují přihlášení a kontrolují formát budoucích zápisů.

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
