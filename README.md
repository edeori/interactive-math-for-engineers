# Interaktív mérnöki matematika

Moduláris, motoralapú tanulási webalkalmazás mérnöki matematika ismétléséhez és
elmélyítéséhez, audió-, DSP-, elektronikai és fizikai példákkal. A tanterv 8 fejezetben
55 leckét és 101 feladatsablont tartalmaz a szintrehozó alapoktól a Fourier/DSP, statisztikai és numerikus
optimalizálási témákig. Az exponenciális lecsengés leckéje a teljesen interaktív
vertikális referencialecke.

Az alkalmazásban a tananyag és a feladatok nincsenek React-komponensekbe égetve. A
`content/` könyvtár strukturált JSON-tartalmát a curriculum loader ellenőrzi, a
feladatmotor pedig a sablon verziója és egy seed alapján determinisztikusan állítja
elő a variánsokat.

## Gyors indítás Dockerrel

Előfeltétel: Docker Desktop vagy Docker Engine Docker Compose támogatással.

```bash
docker compose up --build
```

Az első build néhány percig tarthat. Ha minden health check sikeres:

- webalkalmazás: <http://localhost:3000>
- szimbolikus API és OpenAPI felület: <http://localhost:8000/docs>
- PostgreSQL: `localhost:5432`

Háttérben indítás:

```bash
docker compose up --build -d
docker compose ps
```

Leállítás:

```bash
docker compose down
```

A PostgreSQL-adatok a `postgres-data` Docker volume-ban megmaradnak. A teljes helyi
adatbázis törléséhez — ez minden mentett haladást és próbálkozást eltávolít — külön,
szándékosan a következő parancs használható:

```bash
docker compose down --volumes
```

## Konfiguráció

A Compose biztonságos, lokális alapértékekkel elindul. Saját beállításokhoz:

```bash
cp .env.example .env
```

Fontosabb változók:

| Változó             |          Alapérték | Leírás                      |
| ------------------- | -----------------: | --------------------------- |
| `WEB_PORT`          |             `3000` | A webalkalmazás host portja |
| `SYMBOLIC_PORT`     |             `8000` | A FastAPI host portja       |
| `POSTGRES_PORT`     |             `5432` | A PostgreSQL host portja    |
| `POSTGRES_DB`       | `engineering_math` | Adatbázis neve              |
| `POSTGRES_USER`     |         `math_app` | Adatbázis-felhasználó       |
| `POSTGRES_PASSWORD` |   `math_app_local` | Lokális adatbázisjelszó     |

Publikus telepítés előtt kötelező erős jelszót beállítani, és a PostgreSQL, illetve a
szimbolikus szolgáltatás host portjait nem szabad nyilvánosan kitenni.

## Build és ellenőrzés

Teljes konténeres build:

```bash
docker compose build
```

Csak egy szolgáltatás újraépítése:

```bash
docker compose build web
docker compose build symbolic-service
```

Node.js oldali helyi ellenőrzésekhez Node.js 20.9+ és Corepack szükséges:

```bash
corepack enable
pnpm install
pnpm check
pnpm build
```

A Python szolgáltatás tesztjei virtuális környezetben:

```bash
cd apps/symbolic-service
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[test]'
pytest
```

## Fejlesztői indítás

Először indítsd el a függőségeket:

```bash
docker compose up -d database symbolic-service
```

Ezután a repó gyökeréből:

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

A webalkalmazás a `DATABASE_URL`, `SYMBOLIC_SERVICE_URL` és `CONTENT_ROOT`
változókat használja. A `.env.example` értékei a fenti lokális felálláshoz készültek.

## Új lecke vagy feladat hozzáadása

Az alkalmazás három tartalomtípust tölt be:

```text
content/
├── modules/            # a 0–7. fejezet metaadatai
├── lesson-blueprints/  # tömör, motor által kibontott standard leckék
├── lesson-enrichments/ # részletes magyarázatok és bővített feladatbankok
├── skills/             # külön szerkesztett készségek és előfeltételeik
├── lessons/            # részletes, egyedileg szerkesztett leckék
├── exercises/          # egyedi, verziózott feladatsablonok
└── licenses/           # külső tartalom attribúciója
```

Standard új leckéhez a `content/lesson-blueprints/` megfelelő fejezetfájljába kell
felvenni a valós problémát, intuíciót, formális modellt, alkalmazásokat és checkpointot.
A tantervmotor ebből automatikusan készít készséget, teljes leckeoldalt és
deterministikus ellenőrző feladatot. Egyedi, paraméterezett feladathoz másolj sablont a
`content/exercises/` könyvtárba, adj neki egyedi `id`-t és verziót, majd hivatkozd be a
megfelelő részletes lecke `exerciseTemplateIds` mezőjében.

A feladatmotor jelenleg egész, decimális, választásos és képlettel származtatott
paramétereket, továbbá numerikus toleranciát, pontos választást és szimbolikus
ekvivalenciát támogat.

A teljes 0. fejezet külön mélyítő réteget használ. Mind a kilenc szintrehozó lecke
legalább nyolc magyarázó szekciót és öt ellenőrzési pontot tartalmaz; a diagnosztika
tíz külön készségellenőrző kérdést, tipikus hibaelemzést és első próbálkozás alapú
eredményösszesítést ad.

Minden tartalommódosítás után futtasd:

```bash
pnpm validate:content
```

Ez ellenőrzi a sémákat, hiányzó hivatkozásokat, előfeltétel-ciklusokat, valamint
feladatsablononként 50 generált variánst. Ugyanaz a sablonazonosító, verzió és seed
mindig ugyanazt a feladatpéldányt eredményezi.

Az új interaktív laborok újrafelhasználható React-komponensek. A komponenst az
`apps/web/components/` alatt kell létrehozni, majd egy stabil `labId`-hez regisztrálni
a leckeoldal komponensregiszterében. A lecke csak erre az azonosítóra hivatkozik.

## Architektúra

```text
content JSON
    ↓ séma- és referenciaellenőrzés
curriculum loader → Next.js lecke UI
    ↓
determinista exercise engine → válaszellenőrzés → PostgreSQL próbálkozások
                                      ↓
                              FastAPI / SymPy
```

- `apps/web`: Next.js App Router felület és API route-ok.
- `apps/symbolic-service`: korlátozott, whitelist-alapú FastAPI/SymPy szolgáltatás.
- `packages/shared-types`: közös Zod-sémák és TypeScript-típusok.
- `packages/exercise-engine`: seedelt generálás, biztonságos numerikus kifejezésmotor
  és determinisztikus validátorok.
- `packages/curriculum`: fájlalapú tartalombetöltés és teljes tartalomvalidálás.
- `infra/postgres/init.sql`: a lokális perzisztencia kezdeti adatbázissémája.

## API végpontok

A webalkalmazás fontosabb végpontjai:

- `GET /api/health`
- `GET /api/exercises/:templateId?seed=...`
- `POST /api/exercises/:templateId/submit`
- `GET|POST /api/progress`

A szimbolikus szolgáltatás:

- `POST /equivalence`
- `POST /differentiate`
- `POST /integrate`
- `POST /solve`
- `POST /numerical-compare`
- `POST /validate-domain`

## Jelenlegi korlátok

- Mind az 55 lecke bejárható és saját koncepcióellenőrző feladatot tartalmaz. Az
  exponenciális lecsengés a részletes interaktív referencialecke; a többi lecke
  további egyedi laborokkal és több paraméterezett gyakorlattal mélyíthető.
- A tanulói profil egy helyi, anonim `local-learner`; hitelesítés még nincs.
- A próbálkozások perzisztálódnak, de a mastery-frissítés és az ismétlési sor UI-ja
  még nincs bekötve.
- A szimbolikus műveletek bemeneti hossza és AST-komplexitása korlátozott, de kemény,
  folyamatot megszakító számítási timeout a következő hardening fázis része.
- A PostgreSQL init script csak új Docker volume létrehozásakor fut le. Későbbi
  sémaváltoztatásokhoz verziózott migrációs eszköz szükséges.

A részletes termékspecifikáció a
[`docs/engineering-math-platform-codex-spec.md`](docs/engineering-math-platform-codex-spec.md)
fájlban található.
