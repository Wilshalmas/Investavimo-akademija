# Investavimo Akademija — įdiegimo instrukcijos

Šiame archyve yra viskas, ko reikia, kad programėlė veiktų kaip įdiegiama (offline) programėlė telefone ir kompiuteryje, su progreso sinchronizavimu per Firebase.

Failai:
- `index.html` — pati programėlė
- `manifest.json` — PWA nustatymai (pavadinimas, ikonos, spalvos)
- `sw.js` — service worker, leidžiantis veikti be interneto
- `icon-192.png`, `icon-512.png` — programėlės ikonos

---

## 1 ŽINGSNIS — Firebase projekto sukūrimas (~5 min.)

1. Eikite į [console.firebase.google.com](https://console.firebase.google.com) ir prisijunkite su Google/Gmail paskyra.
2. Spauskite **„Add project"** (Pridėti projektą), duokite pavadinimą (pvz. `investavimo-akademija`), tęskite (Google Analytics galite išjungti, jo nereikia).
3. Kai projektas sukurtas, pagrindiniame projekto puslapyje spauskite ikoną **`</>`** (Web app), duokite programėlei pavadinimą (pvz. `academy-web`) ir spauskite „Register app".
4. Firebase parodys jums kodo bloką, panašų į šį:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "investavimo-akademija.firebaseapp.com",
     projectId: "investavimo-akademija",
     storageBucket: "investavimo-akademija.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
   **Nukopijuokite šį objektą.**

5. Atidarykite `index.html` faile ir suraskite eilutę:
   ```js
   const firebaseConfig = null;
   ```
   Pakeiskite `null` savo nukopijuotu objektu iš 4 žingsnio. Išsaugokite failą.

---

## 2 ŽINGSNIS — Anoniminis prisijungimas

1. Firebase konsolėje kairiajame meniu spauskite **Authentication** → **Get started**.
2. Skiltyje **Sign-in method** raskite **Anonymous** ir įjunkite (Enable) → Save.

Tai leidžia kiekvienam programėlės naudotojui automatiškai gauti unikalų, nematomą ID — jiems nereikės jokio prisijungimo lango.

---

## 3 ŽINGSNIS — Firestore duomenų bazė

1. Kairiajame meniu spauskite **Firestore Database** → **Create database**.
2. Pasirinkite **„Start in production mode"** → Next → pasirinkite bet kurį regioną (pvz. `eur3 (Europe)`) → Enable.
3. Kai duomenų bazė sukurta, eikite į skiltį **Rules** (viršuje) ir įklijuokite šias saugumo taisykles (pakeičia numatytąsias):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /academy_progress/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

   Spauskite **Publish**.

   Šios taisyklės užtikrina, kad kiekvienas vartotojas gali skaityti/rašyti **tik savo** progresą — niekas negali pasiekti kito žmogaus duomenų.

---

## 4 ŽINGSNIS — Kėlimas į GitHub Pages

1. Susikurkite naują repozitoriją GitHub (arba naudokite esamą).
2. Įkelkite VISUS šio archyvo failus į repozitorijos šaknį (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`).
3. Repozitorijos **Settings → Pages** → **Source**: „Deploy from a branch" → **main** → **/ (root)** → Save.
4. Po kelių minučių jūsų programėlė bus pasiekiama adresu `https://jusu-vartotojo-vardas.github.io/repo-pavadinimas/`.

---

## 5 ŽINGSNIS — Įdiegimas telefone/kompiuteryje

- **Telefone** (Android/iPhone): atidarykite nuorodą naršyklėje → meniu → „Pridėti į pradžios ekraną" (Add to Home Screen).
- **Kompiuteryje** (Chrome/Edge): atidarykite nuorodą → adreso juostoje spauskite įdiegimo ikoną (⊕ arba panašią) → „Install".

Po to programėlė veiks kaip savarankiška programėlė, su savo ikona, be naršyklės adreso juostos, ir **veiks net be interneto ryšio** (progresas tuomet saugomas tik šiame įrenginyje, o kai atsiras internetas — automatiškai susinchronizuos su Firebase).

---

## Kaip suprasti sinchronizavimo ženkliuką viršuje

Programėlės viršuje, šalia stipendijos, matysite vieną iš šių ženkliukų:
- ☁️ — progresas sinchronizuotas debesyje
- 🔄 — šiuo metu sinchronizuojama
- 📴 — nėra interneto ryšio, duomenys saugomi tik šiame įrenginyje (susinchronizuos, kai atsiras ryšys)
- 💾 — Firebase dar nesukonfigūruotas (žr. 1 žingsnį), duomenys saugomi tik šiame įrenginyje

---

## Jei norite programėlę naudoti BE Firebase (paprasčiausias variantas)

Tiesiog nieko nekeiskite — palikite `const firebaseConfig = null;` tokį, koks yra. Programėlė puikiai veiks, tik progresas bus saugomas tik tame įrenginyje, kuriame naudojatės (nebus sinchronizuojamas tarp telefono ir kompiuterio, ir gali dingti išvalius naršyklės duomenis ar pilnai pašalinus programėlę).

---

## Klaidų sprendimas

- **Po atnaujinimo GitHub nematau pakeitimų, nors failai tikrai pakeisti** → tai žinoma service worker podėlio problema. Nuo šios versijos `sw.js` naudoja „network-first" strategiją, kuri turėtų tai išspręsti automatiškai ateityje. Jei vis tiek matote seną versiją: atidarykite DevTools (F12) → Application → Service Workers → „Unregister", tada Ctrl+Shift+R. Arba tiesiog atidarykite inkognito lange, kad patikrintumėte, ar nauja versija tikrai yra internete.
- **„Missing or insufficient permissions"** klaidos konsolėje → patikrinkite, ar Firestore Rules (3 žingsnis) tiksliai sutampa su pateiktomis, ir ar Anonymous prisijungimas įjungtas (2 žingsnis).
- **Programėlė neatsinaujina po pakeitimų GitHub** → naršyklėje spauskite Ctrl+Shift+R (priverstinis atnaujinimas be podėlio), arba atidarykite inkognito lange.
- **Ikonos nerodo įdiegimo galimybės** → įsitikinkite, kad visi 5 failai (index.html, manifest.json, sw.js, abi ikonos) yra tame pačiame repozitorijos aplanke.
