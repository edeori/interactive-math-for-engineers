# ADR 0001: Fájlból töltött tartalom és determinisztikus feladatmotor

## Állapot

Elfogadva az MVP-hez.

## Döntés

A készségek, leckék és feladatsablonok verziókövetett JSON-fájlok. A közös Zod-sémák
futásidőben és CI-ben is ellenőrzik őket. A feladatmotor a sablonazonosító, a sablon
verziója és a seed együtteséből generál minden paramétert és a reprodukálható
példányazonosítót.

Az elvárt numerikus válaszok korlátozott saját parserrel értékelődnek ki. Ez nem
használ JavaScript `eval`-t. A szimbolikus feladatok külön FastAPI/SymPy szolgáltatáson
mennek keresztül, amely Python AST-ből, whitelist alapján épít SymPy-kifejezést.

## Következmények

- Új lecke és a támogatott típusokból új feladat UI-kód módosítása nélkül felvehető.
- Egy hibás tartalmi hivatkozás vagy generálhatatlan variáns megállítja a validációt.
- Az interaktív laborok implementációja kód marad, de stabil azonosítón keresztül
  csatlakozik a tartalomhoz.
- A sablon jelentésének változtatásakor a `version` növelése szükséges a korábbi
  próbálkozások reprodukálhatóságához.
