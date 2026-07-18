# Zálohy dat plánovače

`events-2026-07-19-last-known.json` obsahuje poslední úspěšně načtený snímek 23 událostí z nasazené aplikace.

Dne 19. 7. 2026 při následném ověření hlásila aplikace stav `online`, ale Firestore vrátil prázdnou kolekci. Do Firestore nebyl během kontroly proveden žádný zápis ani výmaz. Záloha se nemá automaticky importovat; obnovení musí předcházet kontrola aktuálního stavu a výslovné schválení uživatele.
