# Piksel oda portfolyosu — uygulama planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `liffrey.github.io`'yu, içeriği HTML'de duran ve three.js ile çizilmiş izometrik piksel bir oda olarak sıfırdan yazmak. Proje listesi her gün GitHub'dan kendiliğinden gelecek.

**Architecture:** Vite, `index.html`'i derlerken `content/` dosyalarından ve GitHub verisinden bütün panelleri statik HTML olarak sayfaya basar (küçük bir Vite eklentisi). Tarayıcıda küçük bir `main.js` menüyü, `<dialog>` panellerini, terminali ve oyun menüsünü çalıştırır. three.js sahnesi ayrı bir parça olarak sonradan yüklenir; yüklenemezse sabit resim yerinde kalır. Saf mantık (`src/lib/`) DOM'a ve three.js'e dokunmaz: hem derlemede (Node) hem tarayıcıda çalışır ve `node:test` ile test edilir.

**Tech Stack:** Node 24, Vite 8, three.js 0.187 (npm), `node:test`, GitHub Actions + Pages, başsız Edge + SwiftShader (ekran görüntüsü).

**Spec:** `docs/superpowers/specs/2026-11-14-portfolio-room-design.md`. Görünüş referansı: `docs/superpowers/mockups/pixel-room-v3.html` (aşağıda "taslak") ve `room-*.png`.

## Global Constraints

- Site dili yalnızca İngilizce. Kod, test ve README İngilizce.
- GitHub Pages kullanıcı sitesi, kök yol `/`. Depo `Liffrey/liffrey.github.io`, varsayılan dal `master`. İş `portfolio-room` dalında yapılır.
- Bağımlılık yalnızca `three` ve `vite` (dev). Test için `node:test` + `node:assert/strict`; başka paket yok.
- three.js dahil bütün JavaScript sıkıştırılmış halde **250 KB'ı geçmez** (Task 7'deki denetim derlemeyi durdurur).
- Bütün metin derlenmiş HTML'de durur; oda, içeriğe giden tek yol değildir.
- Hiçbir durumda boş ekran olmaz: sahne çalışana kadar sabit resim (`public/room.png`) görünür.
- Analitik ya da ziyaretçi takibi yok.
- Afişler iki renk + bir motiften kodla üretilir; gerçek afiş görseli yok.
- İçerik eklemek yalnızca `content/*.json` düzenlemekle olur. Yer tutucu metinler `[PLACEHOLDER]` ile başlar.
- Adresler: `#/games`, `#/tech`, `#/cinema`, `#/cv`, `#/contact`.
- Depo konuları: `portfolio-games`, `portfolio-tech`, `portfolio-cinema`. Konusu olmayan depo görünmez.
- Her favori listesinde en fazla 5 kalem.
- Piksel art: düşük çözünürlükte çizim, en yakın komşu büyütme, ortografik kamera (yatay 45°, dikey 30°), sert gölge, derinlikten 1 piksellik kenar, sınırlı palet + Bayer dither.
- `prefers-reduced-motion`: toz, titreme ve kamera uçuşu yok; geçişler anında.
- Pages kaynağını değiştirmek ve `master`'a push etmek Liffrey'nin açık onayını ister (Task 12).
- PowerShell'de `npm.cmd`, Git Bash'te `npm`.

## Review Focus

1. **Boş alanlı depolar.** Liffrey'nin depolarının çoğunda `description`, bazılarında `language` `null`. Sayfada hiçbir yerde "null" ya da "undefined" yazmamalı. → Task 3, Task 5 testleri.
2. **HTML, `</script>` ya da `$&` içeren metin.** Depo açıklamaları GitHub'dan gelir. Bu karakterler sayfayı bozmamalı, betik çalıştırmamalı, satır içi JSON'dan kaçmamalı. → Task 5 testi.
3. **5'ten az favori, 3'ten az film.** Liffrey listeleri yavaş yavaş dolduracak. Boş liste panelde "boş" mesajı, duvarda boş çerçeve göstermeli; hiçbir şey çökmemeli. → Task 5 testi, Task 8 adım 5.
4. **CI'da örnek veriyle yayın.** Veri çekilemezse derleme örnek veriyle devam etmemeli; GitHub boş depo listesi dönerse yayın olmamalı. → Task 3, Task 5 testleri.
5. **Bozuk `?h=` ve gece yarısı.** `?h=abc`, `?h=30`, `?h=` ve 23:59→00:00 geçişi siyah sahne ya da ışıkta sıçrama üretmemeli. → Task 1 testleri.

## Dosya yapısı

```
index.html                 Vite girişi; <!--head--> <!--intro--> <!--panels--> <!--data--> yer tutucuları
vite.config.js             içerik eklentisi: loadData → injectContent
package.json  .gitignore  README.md
content/site.json  favorites.json  projects.extra.json
data/github.sample.json    commit'li örnek veri; data/github.json CI'da üretilir (.gitignore)
public/room.png            WebGL'siz resim + Open Graph görseli
public/fonts/pixelify-sans-400.woff2  public/fonts/OFL.txt
scripts/fetch-github.mjs   GitHub → data/github.json
scripts/load-data.mjs      içerik + veriyi okur, denetler, dönüştürür (Node)
scripts/snapshot.mjs       başsız Edge ile ekran görüntüsü
scripts/check-size.mjs     JS bütçesi
src/lib/                   saf mantık: time content projects calendar posters terminal route render
src/main.js  src/style.css
src/ui/                    panels terminal games clock
src/scene/                 index kit room games tech cinema extras lighting post pick
tests/*.test.js  tests/fixture.js
.github/workflows/deploy.yml
```

---

### Task 1: İskelet ve günün saati

**Files:**
- Create: `package.json`, `.gitignore`, `index.html` (geçici), `src/main.js` (boş), `src/lib/time.js`
- Test: `tests/time.test.js`

**Interfaces:**
- Produces:
  ```js
  // src/lib/time.js — colors are '#rrggbb' strings
  export const KEYFRAMES // [{ h, sun, si, pos: [x,y,z], sky, bg, hs, hg, hi, lamps, stars, city, beam, sunA, moonA }]
  export function sampleTime(h) // → { ...keyframe fields except h, sunDisc: [x, y], moonDisc: [x, y] }
  export function routineAt(h)  // → 'morning' | 'afternoon' | 'evening' | 'night'
  export function formatHour(h) // → 'HH:MM'
  export function parseHourParam(s) // string|null → number in [0, 24) or null
  export function localHour(d = new Date()) // → hours + minutes / 60
  ```

- [ ] **Step 1: Projeyi kur**

```bash
npm init -y
npm install three
npm install -D vite
```
`package.json`: `"name": "liffrey-room"`, `"private": true`, `"type": "module"`, scripts `dev: "vite"`, `build: "vite build"`, `preview: "vite preview"`, `test: "node --test"`. `main`, `keywords` gibi alanları sil.
`.gitignore`: `node_modules/`, `dist/`, `data/github.json`.
Geçici `index.html`: `lang="en"`, `<title>Liffrey</title>`, `<script type="module" src="/src/main.js">` (Task 5 baştan yazar).

- [ ] **Step 2: Failing test yaz** — `tests/time.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleTime, routineAt, formatHour, parseHourParam } from '../src/lib/time.js';

test('midnight is night with lamps dimmed for the film', () => {
  const t = sampleTime(0);
  assert.equal(t.sun, '#9ab8ff');
  assert.equal(t.sunA, 0);
  assert.equal(t.moonA, 1);
  assert.equal(t.lamps, 0.5);
});
test('evening lamps are fully on', () => assert.equal(sampleTime(21.5).lamps, 1));
test('noon is day', () => {
  const t = sampleTime(12);
  assert.equal(t.sun, '#fff0d8');
  assert.equal(t.lamps, 0);
  assert.equal(t.stars, 0);
});
test('24 wraps to 0', () => assert.deepEqual(sampleTime(24), sampleTime(0)));
test('no jumps anywhere in the day', () => {
  for (let h = 0; h < 24; h += 0.01) {
    const a = sampleTime(h), b = sampleTime(h + 0.01);
    assert.ok(Math.abs(a.lamps - b.lamps) < 0.05, `lamps jump at ${h}`);
    assert.ok(Math.abs(a.si - b.si) < 0.1, `sun intensity jumps at ${h}`);
  }
});
test('routine boundaries', () => {
  assert.equal(routineAt(5.99), 'night');
  assert.equal(routineAt(6), 'morning');
  assert.equal(routineAt(12), 'afternoon');
  assert.equal(routineAt(18), 'evening');
  assert.equal(routineAt(22.99), 'evening');
  assert.equal(routineAt(23), 'night');
});
test('formatHour', () => {
  assert.equal(formatHour(7.5), '07:30');
  assert.equal(formatHour(23.999), '23:59');
});
test('parseHourParam rejects junk', () => {
  for (const s of [null, '', ' ', 'abc', '24', '-1', '30']) assert.equal(parseHourParam(s), null, String(s));
  assert.equal(parseHourParam('20.5'), 20.5);
  assert.equal(parseHourParam('0'), 0);
});
```

- [ ] **Step 3: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test` — Expected: FAIL, `Cannot find module '../src/lib/time.js'`.

- [ ] **Step 4: `src/lib/time.js`'i yaz**

`KEYFRAMES`: taslağın 335–347. satırlarındaki değerler aynen. Tek fark lambaların gece kısılması: `h: 0` ve `h: 24` kalemlerinde `lamps: 0.5`; `h: 21.5` ile `h: 24` arasına `{ h: 23.5, ...night, lamps: 0.5 }` eklenir. `sampleTime`: önce `h = ((h % 24) + 24) % 24`, sonra taslağın 352–357. satırlarındaki gibi iki anahtar kare arasında smoothstep. Renkler sRGB hex olarak kanal kanal karıştırılır (`mixHex` modül içinde kalır). `sunDisc`/`moonDisc`: taslağın 373–375. satırlarındaki yay hesabı. `routineAt`: [6,12) morning, [12,18) afternoon, [18,23) evening, gerisi night. `parseHourParam`: `null` ya da boş/boşluk ise `null`, `Number(s)` sonlu değilse ya da [0, 24) dışındaysa `null`.

- [ ] **Step 5: Testleri ve derlemeyi çalıştır**

Run: `npm test` — Expected: 8 test PASS. Run: `npm run build` — Expected: `dist/index.html` oluşur.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore index.html src tests
git commit -m "Scaffold Vite project and time-of-day keyframes"
```

---

### Task 2: İçerik dosyaları ve denetim

**Files:**
- Create: `content/site.json`, `content/favorites.json`, `content/projects.extra.json`, `src/lib/posters.js` (yalnızca `MOTIFS`), `src/lib/content.js`
- Delete: `TODO.md` (Celestial Contact notu `projects.extra.json`'a taşınır)
- Test: `tests/content.test.js`

**Interfaces:**
- Produces:
  ```js
  // src/lib/posters.js
  export const MOTIFS = ['sun', 'moon', 'diamond', 'stripes', 'tower'];
  // src/lib/content.js
  export function validateContent({ site, favorites, extra }) // → string[]; empty = valid; each message starts with the file name, e.g. 'favorites.json: films[2].poster.motif must be one of sun, moon, diamond, stripes, tower'
  ```
- İçerik şekilleri (sonraki bütün görevler bunlara dayanır):
  ```jsonc
  // site.json
  { "name": "Liffrey", "tagline": "[PLACEHOLDER] …", "about": "[PLACEHOLDER] …", "github": "Liffrey",
    "contact": [{ "label": "GitHub", "url": "https://github.com/Liffrey" }],
    "cv": { "summary": "[PLACEHOLDER] …", "pdf": "" } }            // pdf: path under public/, "" = not yet
  // favorites.json — each list 0..5 items
  { "games": [{ "title", "year", "why" }], "tech": [ …same… ],
    "films": [{ "title", "year", "why", "poster": { "colors": ["#bg", "#fg"], "motif": "sun" } }] }
  // projects.extra.json
  { "projects": [{ "name", "title", "corner": "games|tech|cinema", "description", "url": "" }],
    "overrides": { "<repo name>": { "title"?: "…", "description"?: "…" } } }
  ```

- [ ] **Step 1: İçerik dosyalarını yaz**

Her listede 5 yer tutucu: `"[PLACEHOLDER] Game 1"`, yıl `2000`, why `"[PLACEHOLDER] Why I love it."`. Film afişleri sırayla: `["#7a2e2e","#ffd27a"] sun`, `["#1f3b5a","#e8e8f0"] moon`, `["#2e4a3a","#ff8a5a"] diamond` (taslaktaki üç afiş), `["#3a2a5a","#ffcf6a"] stripes`, `["#5a3a1a","#e8e8f0"] tower`. İletişimde yalnızca GitHub; e-postayı Liffrey ekler. `projects.extra.json`: tek proje `{ "name": "celestial-contact", "title": "Celestial Contact", "corner": "games", "description": "[PLACEHOLDER] What it is. Screenshot and GIFs to come.", "url": "" }`, `overrides: {}`. Sonra `git rm TODO.md`.

- [ ] **Step 2: Failing test yaz** — `tests/content.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContent } from '../src/lib/content.js';

const load = f => JSON.parse(readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8'));
const good = () => ({ site: load('site.json'), favorites: load('favorites.json'), extra: load('projects.extra.json') });
const errorsOf = mutate => { const c = good(); mutate(c); return validateContent(c).join('\n'); };

test('shipped content is valid', () => assert.deepEqual(validateContent(good()), []));
test('six favorites are too many', () =>
  assert.match(errorsOf(c => c.favorites.games.push({ title: 'x', year: 2000, why: 'y' })), /favorites\.json: games/));
test('unknown motif', () =>
  assert.match(errorsOf(c => { c.favorites.films[0].poster.motif = 'skull'; }), /films\[0\]\.poster\.motif/));
test('bad poster color', () =>
  assert.match(errorsOf(c => { c.favorites.films[0].poster.colors = ['red', '#fff']; }), /films\[0\]\.poster\.colors/));
test('javascript: contact link is rejected', () =>
  assert.match(errorsOf(c => { c.site.contact[0].url = 'javascript:alert(1)'; }), /site\.json: contact\[0\]\.url/));
test('missing name', () => assert.match(errorsOf(c => { delete c.site.name; }), /site\.json: name/));
test('bad corner', () =>
  assert.match(errorsOf(c => { c.extra.projects[0].corner = 'music'; }), /projects\.extra\.json: projects\[0\]\.corner/));
```

- [ ] **Step 3: Çalıştır, başarısız olduğunu gör**

Run: `npm test` — Expected: content testleri FAIL (`validateContent` yok).

- [ ] **Step 4: `validateContent`'i yaz**

Kurallar:
- site: `name`, `tagline`, `about`, `github` boş olmayan metin. `contact` dizi; her kalemde `label` boş olmayan metin, `url` `https://` ya da `mailto:` ile başlar. `cv.summary` metin, `cv.pdf` metin (`""` olabilir).
- favorites: `games`, `films`, `tech` en fazla 5 kalemli dizi. Her kalemde `title` boş olmayan metin, `year` tam sayı, `why` metin. Filmlerde `poster.colors` iki elemanlı ve her biri `/^#[0-9a-f]{6}$/i`, `poster.motif` `MOTIFS` içinde.
- extra: `projects` dizi; `name` ve `title` boş olmayan metin, `corner` `games|tech|cinema`, `description` metin, `url` `""` ya da `https://…`. `overrides` nesne; her değerde `title`/`description` varsa metin.

- [ ] **Step 5: Çalıştır** — `npm test` → hepsi PASS.

- [ ] **Step 6: Commit**

```bash
git add content src/lib tests
git commit -m "Add content files with placeholders and schema check"
```

---

### Task 3: GitHub verisi

**Files:**
- Create: `src/lib/projects.js`, `src/lib/calendar.js`, `scripts/fetch-github.mjs`, `data/github.sample.json`
- Test: `tests/projects.test.js`, `tests/calendar.test.js`

**Interfaces:**
- Consumes: `content/site.json` → `github`; `projects.extra.json` şekli (Task 2).
- Produces:
  ```js
  // data/github.json and data/github.sample.json
  // { fetchedAt, repos: Repo[], days: [{ date: 'YYYY-MM-DD', count }] }   days ascending
  // Repo = { name, description: string|null, html_url, homepage: string|null, language: string|null, topics: string[], pushed_at }
  // src/lib/projects.js
  export const CORNERS = ['games', 'tech', 'cinema'];
  export function checkRepos(repos) // throws Error('GitHub returned no repositories') unless a non-empty array
  export function toProjects(repos, extra) // → { games: Project[], tech: Project[], cinema: Project[] }
  // Project = { name, title, description, url, language, updated } — all strings, '' when missing; updated 'YYYY-MM-DD'
  // src/lib/calendar.js
  export function calendarWeeks(days, weeks = 13) // → { grid: number[weeks][7] with levels 0..4, total }
  ```

- [ ] **Step 1: Failing testleri yaz**

`tests/projects.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toProjects, checkRepos } from '../src/lib/projects.js';

const none = { projects: [], overrides: {} };
const repo = (name, topics, more = {}) => ({ name, description: null, html_url: `https://github.com/Liffrey/${name}`,
  homepage: null, language: null, topics, pushed_at: '2026-01-01T00:00:00Z', ...more });

test('untagged repos are hidden', () =>
  assert.deepEqual(toProjects([repo('a', [])], none), { games: [], tech: [], cinema: [] }));
test('topic picks the corner and nulls become empty strings', () =>
  assert.deepEqual(toProjects([repo('wavtoflac', ['portfolio-tech'])], none).tech, [{ name: 'wavtoflac', title: 'wavtoflac',
    description: '', url: 'https://github.com/Liffrey/wavtoflac', language: '', updated: '2026-01-01' }]));
test('two topics put a repo in two corners', () => {
  const p = toProjects([repo('x', ['portfolio-games', 'portfolio-cinema'])], none);
  assert.equal(p.games.length, 1);
  assert.equal(p.cinema.length, 1);
});
test('newest first', () => {
  const p = toProjects([repo('old', ['portfolio-tech']), repo('new', ['portfolio-tech'], { pushed_at: '2026-05-01T00:00:00Z' })], none);
  assert.deepEqual(p.tech.map(x => x.name), ['new', 'old']);
});
test('overrides replace title and description', () => {
  const p = toProjects([repo('wavtoflac', ['portfolio-tech'], { description: 'orig' })],
    { projects: [], overrides: { wavtoflac: { title: 'WAV to FLAC', description: 'Converts audio.' } } });
  assert.equal(p.tech[0].title, 'WAV to FLAC');
  assert.equal(p.tech[0].description, 'Converts audio.');
});
test('extra projects come after GitHub ones', () => {
  const extra = { projects: [{ name: 'cc', title: 'CC', corner: 'games', description: 'd', url: '' }], overrides: {} };
  const p = toProjects([repo('g', ['portfolio-games'])], extra);
  assert.deepEqual(p.games.map(x => x.name), ['g', 'cc']);
  assert.deepEqual(p.games[1], { name: 'cc', title: 'CC', description: 'd', url: '', language: '', updated: '' });
});
test('empty GitHub answer is an error', () => {
  assert.throws(() => checkRepos([]), /no repositories/);
  assert.throws(() => checkRepos(undefined), /no repositories/);
});
```

`tests/calendar.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendarWeeks } from '../src/lib/calendar.js';

const days = counts => counts.map((count, i) => ({ date: `d${i}`, count }));

test('no data gives an empty 13x7 grid', () => {
  const c = calendarWeeks([]);
  assert.equal(c.grid.length, 13);
  assert.ok(c.grid.every(w => w.length === 7 && w.every(l => l === 0)));
  assert.equal(c.total, 0);
});
test('busiest day is level 4, a small day is level 1', () => {
  const counts = Array(100).fill(0); counts[99] = 8; counts[98] = 1;
  const c = calendarWeeks(days(counts));
  assert.equal(c.grid[12][6], 4);
  assert.equal(c.grid[12][5], 1);
  assert.equal(c.total, 9);
});
test('only the last 91 days count', () => {
  const counts = Array(100).fill(0); counts[0] = 50;
  assert.equal(calendarWeeks(days(counts)).total, 0);
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu gör** — `npm test` → yeni testler FAIL.

- [ ] **Step 3: `toProjects`, `checkRepos`, `calendarWeeks`'i yaz**

`toProjects`: depo, her `portfolio-<corner>` konusu için o köşeye girer. `title = override.title ?? name`, `description = override.description ?? repo.description ?? ''`, `url = html_url`, `language = language ?? ''`, `updated = pushed_at.slice(0, 10)`. Köşe içinde `updated` azalan sırada; ekstra projeler dosya sırasıyla en sona.
`calendarWeeks`: son `weeks*7` gün, eksikse başa sıfır eklenir, 7'şer günlük sütunlara bölünür. Seviye: `count === 0 ? 0 : Math.ceil(count / max * 4)`. Koda şu yorum eklenir: `// shortcut: columns are 7-day chunks, not Sunday-aligned weeks; align them if the wall ever looks off`.

- [ ] **Step 4: Çalıştır** — `npm test` → hepsi PASS.

- [ ] **Step 5: `scripts/fetch-github.mjs`'i yaz**

`GITHUB_TOKEN` yoksa hata fırlatır. Kullanıcı adı `content/site.json` → `github`. Başlıklar: `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, `User-Agent: liffrey-room-build`.
1. `GET https://api.github.com/users/<github>/repos?per_page=100&type=owner` → `res.ok` değilse hata; `checkRepos`; `Repo` alanlarına indirgenir. Yorum: `// shortcut: one page = max 100 repos; paginate past that`.
2. `POST https://api.github.com/graphql` ile aşağıdaki sorgu. `errors` varsa mesajlarıyla hata fırlatır. Günler `weeks[].contributionDays[]`'den düzleştirilir → `{ date, count: contributionCount }`.
   ```graphql
   query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
     weeks { contributionDays { date contributionCount } } } } } }
   ```
3. `data/github.json` = `{ fetchedAt: new Date().toISOString(), repos, days }`, iki boşlukla girintili. Sonunda `<n> repos, <m> days` yazar. Hata olursa süreç sıfırdan farklı kodla biter (en üst düzeyde `await`, `catch` yok).

- [ ] **Step 6: Gerçek veriyle dene, örnek veriyi üret**

Run (Git Bash): `GITHUB_TOKEN=$(gh auth token) node scripts/fetch-github.mjs`. Expected: `19 repos, 3xx days`.
`data/github.json`'u `data/github.sample.json` olarak kopyala. Kopyada şu depolara konu ekle (yalnızca örnek; gerçek konuları Liffrey GitHub'da koyar): `2D_Platform`, `openglProject-cpp` → `portfolio-games`; `filetransfer`, `wavtoflac`, `studyThreeJS` → `portfolio-tech`; `cinevault`, `movie-database-app` → `portfolio-cinema`. Sonra `data/github.json`'u sil; geliştirme sunucusu örnek veriyi kullansın.

- [ ] **Step 7: Commit**

```bash
git add src/lib tests scripts/fetch-github.mjs data/github.sample.json
git commit -m "Fetch GitHub repos and contributions; map topics to corners"
```

---

### Task 4: Terminal komutları

**Files:**
- Create: `src/lib/terminal.js`
- Test: `tests/terminal.test.js`

**Interfaces:**
- Consumes: `Project` (Task 3).
- Produces:
  ```js
  // TermData = { about: string, projects: Project[] /* tech corner */, favorites: [{ title, year, why }] /* favorites.tech */ }
  // Line = string | { text: string, cmd: string }   // cmd: the command a click on this line runs
  export const COMMANDS = ['help', 'ls', 'cat', 'open', 'whoami', 'favorites', 'clear', 'exit'];
  export function runCommand(input, data) // → { lines: Line[], clear?: true, exit?: true, open?: string }
  export function complete(input, data)   // → the completed input (unchanged if nothing to add)
  ```

Davranış: komut adları ve proje adları büyük/küçük harf duyarsız, baştaki/sondaki boşluk yok sayılır.

| Girdi | Sonuç |
|---|---|
| `''` | `{ lines: [] }` |
| `help` | her komut için bir satır `{ text: 'ls         list projects', cmd: 'ls' }` (`cat`/`open` için `cmd` yok, açıklamada `<project>`) |
| `ls` | her proje için `{ text: name, cmd: 'cat ' + name }`; proje yoksa `'no projects yet'` |
| `cat <p>` | `[title, description?, 'language · updated'?, { text: 'open ' + name, cmd: 'open ' + name }]`; boş alanlar atlanır (üçüncü satır, dolu olanları `' · '` ile birleştirir), `url` yoksa son satır yok |
| `cat` | `'usage: cat <project>'`; bilinmeyen: `'cat: <p>: no such project'` |
| `open <p>` | `{ lines: ['opening ' + url], open: url }`; `url` yoksa `'open: <p>: no link'` |
| `whoami` | `about` satırlara bölünmüş |
| `favorites` | `` `${title} (${year}) — ${why}` `` her kalem için; boşsa `'no favorites yet'` |
| `clear` / `exit` | `{ lines: [], clear: true }` / `{ lines: [], exit: true }` |
| başka | `` `command not found: ${cmd}. Type 'help'.` `` |

`complete`: boşluk yoksa tek eşleşen komutu tamamlar (`cat`/`open` sonrasına boşluk ekler). `cat `/`open ` sonrası proje adı önekini tamamlar. Birden çok eşleşmede ortak öneki verir; eşleşme yoksa girdiyi aynen döner.

- [ ] **Step 1: Failing test yaz** — `tests/terminal.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCommand, complete } from '../src/lib/terminal.js';

const p = (name, more = {}) => ({ name, title: name, description: '', url: `https://github.com/Liffrey/${name}`, language: '', updated: '', ...more });
const data = { about: 'Line one\nLine two', favorites: [{ title: 'Rust', year: 2015, why: 'Fearless.' }],
  projects: [p('wavtoflac', { description: 'Converts audio.', language: 'Python', updated: '2026-10-12' }), p('filetransfer'), p('studyThreeJS')] };

test('ls lists clickable projects', () =>
  assert.deepEqual(runCommand('ls', data).lines[0], { text: 'wavtoflac', cmd: 'cat wavtoflac' }));
test('cat shows details and skips empty fields', () => {
  assert.deepEqual(runCommand('cat wavtoflac', data).lines, ['wavtoflac', 'Converts audio.', 'Python · 2026-10-12', { text: 'open wavtoflac', cmd: 'open wavtoflac' }]);
  assert.deepEqual(runCommand('cat filetransfer', data).lines, ['filetransfer', { text: 'open filetransfer', cmd: 'open filetransfer' }]);
});
test('names and commands ignore case and spaces', () =>
  assert.equal(runCommand('  CAT WAVTOFLAC ', data).lines[0], 'wavtoflac'));
test('unknown project and missing argument', () => {
  assert.deepEqual(runCommand('cat nope', data).lines, ['cat: nope: no such project']);
  assert.deepEqual(runCommand('cat', data).lines, ['usage: cat <project>']);
});
test('open returns the url', () =>
  assert.equal(runCommand('open wavtoflac', data).open, 'https://github.com/Liffrey/wavtoflac'));
test('whoami, favorites, clear, exit', () => {
  assert.deepEqual(runCommand('whoami', data).lines, ['Line one', 'Line two']);
  assert.deepEqual(runCommand('favorites', data).lines, ['Rust (2015) — Fearless.']);
  assert.equal(runCommand('clear', data).clear, true);
  assert.equal(runCommand('exit', data).exit, true);
});
test('unknown command', () =>
  assert.deepEqual(runCommand('rm -rf /', data).lines, ["command not found: rm. Type 'help'."]));
test('empty project list', () =>
  assert.deepEqual(runCommand('ls', { ...data, projects: [] }).lines, ['no projects yet']));
test('tab completion', () => {
  assert.equal(complete('wh', data), 'whoami');
  assert.equal(complete('ca', data), 'cat ');
  assert.equal(complete('cat wav', data), 'cat wavtoflac');
  assert.equal(complete('cat ', data), 'cat ');      // three matches, no common prefix
  assert.equal(complete('zz', data), 'zz');
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu gör** — `npm test` → FAIL.
- [ ] **Step 3: `runCommand` ve `complete`'i tablodaki gibi yaz.**
- [ ] **Step 4: Çalıştır** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git add src/lib/terminal.js tests/terminal.test.js && git commit -m "Add terminal command parser"`

---

### Task 5: Statik site: bütün içerik HTML'de

**Files:**
- Create: `vite.config.js`, `scripts/load-data.mjs`, `scripts/snapshot.mjs`, `src/lib/render.js`, `src/style.css`, `public/fonts/pixelify-sans-400.woff2`, `public/fonts/OFL.txt`, `public/room.png` (geçici: `docs/superpowers/mockups/room-20.png`'nin kopyası, Task 10'da yenilenir)
- Modify: `index.html` (baştan), `src/main.js` (`import './style.css'`), `src/lib/posters.js`
- Test: `tests/fixture.js`, `tests/render.test.js`, `tests/load-data.test.js`, `tests/posters.test.js`

**Interfaces:**
- Consumes: `validateContent`, `MOTIFS` (Task 2); `toProjects`, `calendarWeeks` (Task 3); `runCommand` (Task 4).
- Produces:
  ```js
  // scripts/load-data.mjs
  export function loadData({ root = process.cwd(), env = process.env } = {})
  // → Data = { site, favorites, extra, projects: { games, tech, cinema }, calendar: { grid, total } }
  // src/lib/posters.js
  export function motifPixels(motif) // → [[x, y, w, h], …] on an 8×12 grid
  export function posterSVG(poster)  // → '<svg viewBox="0 0 8 12" shape-rendering="crispEdges" aria-hidden="true">…'
  // src/lib/render.js
  export function esc(s)                   // escapes & < > " '
  export function injectContent(html, data) // fills <!--head--> <!--intro--> <!--panels--> <!--data-->
  // Inline JSON for main.js and the scene: <script type="application/json" id="data">
  //   { about, favorites, projects, calendar }   with every '<' written as \u003c
  ```
- Sonraki görevlerin dayandığı DOM sözleşmesi:
  - Panel: `<dialog id="panel-{route}" class="panel" aria-labelledby="h-{route}">`, içinde `<h2 id="h-{route}">` ve `<button type="button" class="back">Back</button>`. Başlıklar: Games, Tech, Cinema, CV, Contact.
  - **tech:** `.term-out`'ta `whoami`, `ls`, `favorites` çıktıları önceden basılır (her biri `$ <cmd>` satırından sonra, `runCommand` ile üretilir). `cmd`'li satırlar `<button type="button" class="term-link" data-cmd="…">`, diğerleri `<div>`. Altında `<form class="term-in">` + `<input name="cmd" autocomplete="off" spellcheck="false" aria-label="Terminal command">`, ardından `<figure class="calendar">`: SVG + `<figcaption>{total} contributions in the last 13 weeks</figcaption>`, en sonda `<details class="plain"><summary>Projects as a list</summary>` + proje listesi `</details>` (proje açıklamaları terminal dışında da HTML'de dursun diye).
  - **games:** iki `<ul class="row">` (önce projeler, sonra "Favorites" başlıklı favoriler). Her kalem `<button type="button" class="cart" data-detail="gd-{n}">`, ayrıntısı `<article class="game-detail" id="gd-{n}">`; yalnızca n=0 görünür, diğerleri `hidden`. Boş satır: `<p class="empty">No projects yet.</p>` (buton yok).
  - **cinema:** `<ol class="films">` (posterSVG, başlık, yıl, why), ardından "Projects" listesi; liste boşsa "No projects yet.".
  - **cv:** özet; `pdf` varsa `<a href="/{pdf}" download>Download CV (PDF)</a>`, yoksa `<p>PDF coming soon.</p>`.
  - **contact:** `<ul>` içinde `<a href rel="me noopener" target="_blank">`.
  - Proje kalemi: başlık (`url` varsa bağlantı), boş değilse açıklama, boş değilse `language · updated`.
  - intro: `<h1>{name}</h1><p class="tagline">{tagline}</p>`.
  - head: `<title>{name}</title>`, `description` = tagline, `og:title`, `og:description`, `og:image` = `https://{github küçük harfle}.github.io/room.png` (1200×630), `twitter:card` = `summary_large_image`.
  - `index.html` gövdesi: `<header class="intro"><!--intro--></header>`, `<nav class="menu" aria-label="Sections">` (5 bağlantı `href="#/{route}"`), `<div id="stage"><img class="still" src="/room.png" alt="Pixel-art room with a gaming corner, a desk with a computer and a wall of film posters" width="1200" height="630"></div>`, `<!--panels-->`, `<!--data-->`, modül betiği.

- [ ] **Step 1: Yazı tipini indir**

```bash
mkdir -p public/fonts
curl -fsSL -o public/fonts/pixelify-sans-400.woff2 https://cdn.jsdelivr.net/fontsource/fonts/pixelify-sans@latest/latin-400-normal.woff2
curl -fsSL -o public/fonts/OFL.txt https://raw.githubusercontent.com/google/fonts/main/ofl/pixelifysans/OFL.txt
```
Expected: woff2 dosyası `wOF2` ile başlar, `OFL.txt` "SIL Open Font License" içerir. Adres değiştiyse aynı yazı tipini Google Fonts deposundan al.

- [ ] **Step 2: Failing testleri yaz**

`tests/fixture.js`: içerik ve örnek veriyi geçici bir klasöre kopyalar; testler gerçek `data/github.json`'dan etkilenmez.
```js
import { mkdtempSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const repoRoot = fileURLToPath(new URL('..', import.meta.url));
export function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), 'room-'));
  cpSync(join(repoRoot, 'content'), join(root, 'content'), { recursive: true });
  mkdirSync(join(root, 'data'));
  cpSync(join(repoRoot, 'data/github.sample.json'), join(root, 'data/github.sample.json'));
  return root;
}
```

`tests/load-data.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData } from '../scripts/load-data.mjs';
import { fixtureRoot } from './fixture.js';

test('local build uses sample data', () => {
  const d = loadData({ root: fixtureRoot(), env: {} });
  assert.ok(d.projects.tech.length > 0);
  assert.equal(d.calendar.grid.length, 13);
});
test('CI build refuses to fall back to sample data', () =>
  assert.throws(() => loadData({ root: fixtureRoot(), env: { CI: 'true' } }), /github\.json/));
test('broken content stops the build', () => {
  const root = fixtureRoot(), f = join(root, 'content/site.json');
  writeFileSync(f, JSON.stringify({ ...JSON.parse(readFileSync(f, 'utf8')), name: '' }));
  assert.throws(() => loadData({ root, env: {} }), /site\.json: name/);
});
test('CV pdf that does not exist is an error', () => {
  const root = fixtureRoot(), f = join(root, 'content/site.json'), s = JSON.parse(readFileSync(f, 'utf8'));
  s.cv.pdf = 'cv.pdf';
  writeFileSync(f, JSON.stringify(s));
  assert.throws(() => loadData({ root, env: {} }), /cv\.pdf/);
});
```

`tests/render.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { injectContent } from '../src/lib/render.js';
import { loadData } from '../scripts/load-data.mjs';
import { fixtureRoot, repoRoot } from './fixture.js';

const html = readFileSync(join(repoRoot, 'index.html'), 'utf8');
const data = () => loadData({ root: fixtureRoot(), env: {} });
const inline = out => JSON.parse(out.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/)[1]);

test('every placeholder is filled and every panel exists', () => {
  const out = injectContent(html, data());
  assert.doesNotMatch(out, /<!--(head|intro|panels|data)-->/);
  for (const r of ['games', 'tech', 'cinema', 'cv', 'contact']) assert.match(out, new RegExp(`<dialog id="panel-${r}"`));
  assert.match(out, /\[PLACEHOLDER\] Film 1/);
});
test('hostile text is escaped and stays intact in inline JSON', () => {
  const d = data(), evil = '<img src=x onerror=alert(1)></script><script>alert(2)</script> $& $\'';
  d.projects.tech[0].description = evil;
  const out = injectContent(html, d);
  assert.doesNotMatch(out, /<img src=x/);
  assert.match(out, /&lt;img src=x/);
  assert.equal(inline(out).projects.tech[0].description, evil);
});
test('empty lists render empty states, never null or undefined', () => {
  const d = data();
  d.projects = { games: [], tech: [], cinema: [] };
  d.favorites = { games: [], films: [], tech: [] };
  const out = injectContent(html, d);
  assert.match(out, /No projects yet\./);
  assert.doesNotMatch(out, />[^<]*\b(undefined|null)\b/);
});
test('null-ish repo fields leave no trace', () =>
  assert.doesNotMatch(injectContent(html, data()), />[^<]*\b(undefined|null)\b/));
```

`tests/posters.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOTIFS, motifPixels, posterSVG } from '../src/lib/posters.js';

test('every motif draws inside the 8x12 grid', () => {
  for (const m of MOTIFS) {
    const px = motifPixels(m);
    assert.ok(px.length > 0, m);
    for (const [x, y, w, h] of px) assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 8 && y + h <= 12, m);
  }
});
test('poster svg uses both colors', () => {
  const s = posterSVG({ colors: ['#112233', '#445566'], motif: 'sun' });
  assert.match(s, /#112233/);
  assert.match(s, /#445566/);
});
```

- [ ] **Step 3: Çalıştır, başarısız olduğunu gör** — `npm test` → yeni testler FAIL.

- [ ] **Step 4: Kodu yaz**

- `loadData`: `content/*.json` okunur. `data/github.json` varsa o, yoksa `env.CI` doluysa `Error('data/github.json missing: run scripts/fetch-github.mjs')`, değilse `data/github.sample.json`. Hatalar `validateContent`'ten gelir; `site.cv.pdf` doluysa `public/<pdf>` var mı diye de bakılır. Hata varsa `Error('Content errors:\n' + list.join('\n'))`. Dönüşte `toProjects` ve `calendarWeeks` sonuçları.
- `motifPixels`: beş motifin her biri 8×12 ızgarada birkaç dikdörtgen (sun: daire benzeri, moon: hilal, diamond: eşkenar dörtgen, stripes: yatay bantlar, tower: tek bina + pencereler). Çizim inşa edenindir.
- `injectContent`: DOM sözleşmesine uyar. Bütün metin `esc` ile geçer. Yer değiştirmede **replacer fonksiyonu** kullanılır (`html.replace('<!--panels-->', () => panels)`), çünkü düz metin değiştirme `$&`'yi bozar.
- `vite.config.js`: tek eklenti. `transformIndexHtml(html)` → `injectContent(html, loadData())`. `configureServer`'da `content/` ve `data/` izlenir, değişiklikte `server.ws.send({ type: 'full-reload' })`.
- `style.css`: taslaktaki gibi koyu (`#0e0c15` zemin, `#e8e4f0` metin); her metin ≥ 4.5:1 zıtlıkta. `#stage` bütün ekranı kaplar (`position: fixed; inset: 0`); `.still` için `object-fit: cover; image-rendering: pixelated`. `.intro` sol üstte. `.menu` masaüstünde sağ üstte, 700px altında altta tam genişlik çubuk. `dialog.panel` ortada, `max-width: 760px`, `max-height: 85vh`, kaydırılabilir; `::backdrop` yarı saydam. `@font-face` Pixelify Sans (`/fonts/pixelify-sans-400.woff2`, `font-display: swap`) yalnızca `h1, h2, .menu, .cart` için; gövde sistem yazı tipi, terminal `ui-monospace`.
- `scripts/snapshot.mjs`: `node scripts/snapshot.mjs --out <file> [--url "/?h=20&snapshot"] [--size 1200,630] [--no-webgl]`. `dist/`'i Vite'ın `preview()` API'siyle boş bir portta sunar. Edge'i (`EDGE` ortam değişkeni ya da `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) şu bayraklarla çalıştırır: `--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --window-size=W,H --virtual-time-budget=8000 --screenshot=<mutlak yol>`. `--no-webgl` verilirse `--disable-3d-apis` eklenir. Sonunda sunucuyu kapatır. Argümanlar `node:util` `parseArgs` ile okunur.

- [ ] **Step 5: Testleri çalıştır** — `npm test` → hepsi PASS.

- [ ] **Step 6: Derle ve bak**

Run: `npm run build`, sonra `grep -c 'id="panel-' dist/index.html`. Expected: `5`.
Run: `node scripts/snapshot.mjs --out <scratchpad>/static.png --size 1200,800`. Görüntüyü aç: sol üstte ad ve tanıtım satırı, menü, arkada oda resmi.

- [ ] **Step 7: Commit**

```bash
git add index.html vite.config.js scripts src tests public
git commit -m "Render all content as static HTML at build time"
```

---

### Task 6: Menü, paneller, terminal, oyun menüsü (sahnesiz)

**Files:**
- Create: `src/lib/route.js`, `src/ui/panels.js`, `src/ui/terminal.js`, `src/ui/games.js`
- Modify: `src/main.js`, `src/style.css`
- Test: `tests/route.test.js`

**Interfaces:**
- Consumes: DOM sözleşmesi ve satır içi JSON (Task 5); `runCommand`, `complete` (Task 4).
- Produces:
  ```js
  // src/lib/route.js
  export const ROUTES = ['games', 'tech', 'cinema', 'cv', 'contact'];
  export function parseRoute(hash)              // '#/tech' → 'tech'; anything else → null
  export function moveSelection(rows, [r, c], key) // rows = item count per row → [r, c]
  // src/ui/panels.js
  export function initPanels({ onOpen = () => {}, onClose = () => {} } = {}) // → { navigate(route), home() }
  // src/ui/terminal.js
  export function initTerminal(dialog, termData, { exit })
  // src/ui/games.js
  export function initGames(dialog)
  ```

- [ ] **Step 1: Failing test yaz** — `tests/route.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, moveSelection } from '../src/lib/route.js';

test('parseRoute', () => {
  assert.equal(parseRoute('#/tech'), 'tech');
  assert.equal(parseRoute('#/contact'), 'contact');
  for (const h of ['', '#', '#/', '#/foo', '#tech', '#/tech/x']) assert.equal(parseRoute(h), null, h);
});
test('moveSelection stays inside rows and skips empty ones', () => {
  assert.deepEqual(moveSelection([3, 5], [0, 2], 'ArrowRight'), [0, 2]);
  assert.deepEqual(moveSelection([3, 5], [0, 0], 'ArrowLeft'), [0, 0]);
  assert.deepEqual(moveSelection([3, 5], [1, 4], 'ArrowUp'), [0, 2]);
  assert.deepEqual(moveSelection([3, 5], [0, 1], 'ArrowDown'), [1, 1]);
  assert.deepEqual(moveSelection([0, 5], [1, 1], 'ArrowUp'), [1, 1]);
  assert.deepEqual(moveSelection([3, 5], [0, 1], 'Enter'), [0, 1]);
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu gör** — `npm test` → FAIL.
- [ ] **Step 3: `parseRoute` ve `moveSelection`'ı yaz.** Sol/sağ satır içinde ±1, uçta durur. Yukarı/aşağı bir önceki/sonraki boş olmayan satıra geçer, sütun o satırın son öğesine kırpılır. Diğer tuşlarda konum aynı kalır.
- [ ] **Step 4: Çalıştır** — `npm test` → PASS.

- [ ] **Step 5: Panelleri yaz** (`src/ui/panels.js`)

- `handle()`: `route = parseRoute(location.hash)`. Rota varsa açık başka panel kapanır, `await onOpen(route)`, ardından `dialog.showModal()` (odak panelin içinde kalır, kapanınca açan öğeye döner). Rota yoksa açık panel kapanır, `onClose()` çağrılır. Sayfa açılışında ve `hashchange`'te çalışır.
- `navigate(route)`: `history.pushState({ inApp: true }, '', '#/' + route)`, sonra `handle()`. Menü bağlantılarına tıklama `preventDefault` + `navigate`.
- `home()`: `history.state?.inApp` ise `history.back()`. Değilse (paylaşılan bağlantıyla gelinmiştir) `history.replaceState(null, '', location.pathname + location.search)` + `handle()`. Böylece Esc ziyaretçiyi siteden çıkarmaz.
- Kapanış: Back butonu `dialog.close()` çağırır. Esc'yi tarayıcı kendisi kapatır (`cancel` engellenmez). Dialog'un `close` olayında rota hâlâ bu paneli gösteriyorsa `home()` çağrılır.

- [ ] **Step 6: Terminal ve oyun arayüzünü yaz**

- `initTerminal`: form gönderilince `$ <girdi>` satırı eklenir, `runCommand` çalışır. `clear` çıktıyı boşaltır, `exit` → `exit()`, `open` → `window.open(url, '_blank', 'noopener')`. `cmd`'li satırlar `.term-link` butonu olur; `.term-link` tıklaması komutunu çalıştırır. ↑/↓ girilen komut geçmişinde gezer. Tab yalnızca `complete` girdiyi değiştirirse `preventDefault` eder; aksi halde odak normal şekilde ilerler (klavye kullanıcısı tuzağa düşmez). Her çıktıdan sonra en alta kaydırılır. Panel açılınca odak girdiye gelir.
- `initGames`: `.cart`'a odaklanınca ya da tıklayınca ilgili `gd-*` görünür, diğerleri `hidden` olur; seçili buton `aria-pressed="true"` alır. Ok tuşları `moveSelection` ile sonraki butona odaklar.
- `main.js`: satır içi JSON okunur. `initPanels()`; `initTerminal(#panel-tech, { about, projects: projects.tech, favorites: favorites.tech }, { exit: panels.home })`; `initGames(#panel-games)`.

- [ ] **Step 7: Doğrula**

Run: `npm test && npm run build`. Expected: PASS ve derleme başarılı.
Run: `node scripts/snapshot.mjs --url "/#/tech" --out <scratchpad>/tech.png --size 1200,800` (ve `#/cinema`). Expected: panel açık açılır.
Elle (Liffrey ya da tarayıcı otomasyonu, `npm run dev`): menü beş paneli açıyor; Back, Esc ve tarayıcının geri tuşu kapatıyor; `#/cv` doğrudan açılıp Esc'ye basılınca site içinde kalınıyor; terminalde `help` → `ls` → bir projeye tıklama → `cat wav` + Tab → ↑ çalışıyor, `exit` kapatıyor; oyun menüsünde oklar seçimi taşıyor.

- [ ] **Step 8: Commit** — `git add src tests && git commit -m "Menu, dialogs, terminal and game menu without the scene"`

---

### Task 7: Odanın sahnesi (taslağın modüllere taşınması)

**Files:**
- Create: `src/scene/index.js`, `src/scene/kit.js`, `src/scene/room.js`, `src/scene/games.js`, `src/scene/tech.js`, `src/scene/cinema.js`, `src/scene/lighting.js`, `src/scene/post.js`, `scripts/check-size.mjs`
- Modify: `src/main.js`, `src/style.css`, `package.json` (`build`)

**Interfaces:**
- Consumes: `sampleTime`, `routineAt`, `parseHourParam`, `localHour` (Task 1); satır içi JSON (Task 5).
- Produces:
  ```js
  // src/scene/kit.js
  export function makeKit(root) // → { box, glowBox, flat, point, zone, rnd }
  //   box/glowBox/flat/point: same signatures as the mockup, parent defaults to root
  //   zone(name, label) → THREE.Group with userData { zone: name, label }, added to root
  //   rnd: the mockup's seeded random (seed 11)
  // src/scene/room.js
  export function buildRoom(kit, scene) // → RoomRefs { hemi, sun, skyMat, sunMat, moonMat, sunDisc, moonDisc, starMat, cityMat, cityWinMat, beamMat, dust, dustMat, updateBeam, tickDust(s), lamp, shade, strings, bulbs }
  // src/scene/{games,tech,cinema}.js
  export function build(kit, data) // → { zone, tick(s, routine, motion), ...refs used by lighting }
  // src/scene/lighting.js
  export function applyTime(room, corners, t) // t = sampleTime(h); corners = { games, tech, cinema }
  // src/scene/post.js
  export function makePost(renderer) // → { setSize(w, h), render(scene, cam) }
  // src/scene/index.js
  export async function start(stage, data, { hour, reducedMotion }) // → { setHour(h | null) }
  ```

- [ ] **Step 1: Taslağı taşı**

Dosya ↔ taslak satırları: `kit.js` ← 76–117; `room.js` ← 119–221 ve 328–331 (bitki); `games.js` ← 223–258; `tech.js` ← 260–297; `cinema.js` ← 299–326; `lighting.js` ← 358–376 (ara değer hesabı artık `sampleTime`'da; yalnızca değerleri three nesnelerine yazar); `post.js` ← 379–411 (kenar ve dither hep açık, ayar uniform'ları yok); `index.js` ← 57–72, 413–428, 469–502 (kaydırıcı ve kutucuklar yok). Bölge etiketleri İngilizce: `Games`, `Tech`, `Cinema`. Taslağın canlılıkları (TV titremesi, neon cızırtısı, RGB, ampuller, LED, kedi, toz) ilgili köşenin `tick`'ine ya da `room.tickDust`'a gider. `motion === false` iken titreme, cızırtı ve göz kırpma durur, değerler sabit kalır.

- [ ] **Step 2: `start()`'ı tamamla**

- `new THREE.WebGLRenderer({ antialias: false })` hata fırlatırsa ya da `getContext()` boş dönerse hata yukarı çıkar. Canvas, ilk kare çizildikten sonra `stage`'e eklenir.
- Yeniden boyutlandırma (`ResizeObserver`): `px = stage.clientWidth < 700 ? 4 : 3`; görünüm yüksekliği `Math.max(12, 12.5 / aspect)` (dar ekranda oda sığsın diye); güneş gölge haritası başlangıçta genişlik < 700 ise 1024, değilse 2048.
- Saat: `setHour(null)` her karede `localHour()`'u izler, sayı verilirse o saatte sabit kalır. Her karede `applyTime(room, corners, sampleTime(h))` ve köşelerin `tick(s, routineAt(h), !reducedMotion)`'u çağrılır.
- `reducedMotion`: toz gizlenir.
- `visibilitychange`: `document.hidden` iken `renderer.setAnimationLoop(null)`, görünür olunca döngü yeniden başlar.

- [ ] **Step 3: `main.js`'e bağla**

`const params = new URLSearchParams(location.search)`; `params.has('snapshot')` ise `document.body.classList.add('snapshot')`. `import('./scene/index.js')` → `start(stage, data, { hour: parseHourParam(params.get('h')), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches })` → `stage.classList.add('live')`. Hata olursa `console.warn('Room scene unavailable, showing the still image', err)`; sabit resim zaten görünür.
CSS: `#stage canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated }`, `#stage.live .still { display: none }`, `.snapshot .intro, .snapshot .menu { display: none }`.

- [ ] **Step 4: JS bütçesini ekle**

`scripts/check-size.mjs`: `dist/assets/*.js` dosyalarının `zlib.gzipSync` boyutlarını toplar, `JS gzip: <n> KB / 250 KB` yazar, `250 * 1024`'ü aşarsa `process.exit(1)`. `package.json` → `"build": "vite build && node scripts/check-size.mjs"`.

- [ ] **Step 5: Doğrula**

Run: `npm test && npm run build`. Expected: PASS ve `JS gzip: … KB / 250 KB` en fazla 250.
Run: `--url "/?h=7.3&snapshot"`, `h=12`, `h=18.2`, `h=20` ile `--size 1000,760` ekran görüntüleri. Bunları `docs/superpowers/mockups/room-*.png` ile karşılaştır: aynı oda, aynı ışık dili (yerleşim tam ekran olduğu için piksel piksel değil).
Run: `--url "/?h=12&snapshot" --size 390,844`. Expected: bütün oda ekranda.
Run: `--no-webgl --url "/"`. Expected: sabit resim, boş ekran yok.

- [ ] **Step 6: Commit** — `git add src scripts package.json && git commit -m "Port the pixel room scene into modules with a still-image fallback"`

---

### Task 8: Sahnede içerik: afişler, takvim, CV, telefon

**Files:**
- Create: `src/scene/extras.js`
- Modify: `src/scene/kit.js`, `src/scene/cinema.js`, `src/scene/index.js`

**Interfaces:**
- Consumes: `motifPixels` (Task 5); satır içi JSON'da `favorites.films`, `calendar.grid`; `kit.zone` (Task 7).
- Produces:
  ```js
  kit.pixelTexture(w, h, draw /* (ctx) => void */) // → THREE.CanvasTexture, NearestFilter, SRGBColorSpace
  // src/scene/extras.js
  export function build(kit, data, techZone) // → { cv: Group, contact: Group, calendar: Mesh }
  ```

Konumlar öneridir; görüntüye bakarak kaydır. Yeni nesneler diğerlerini kapatmamalı.

- [ ] **Step 1: Afişler.** `cinema.js` `data.favorites.films`'i alır. Çerçeve `i` (0..2) `films[i]`'yi gösterir: taslağın `art` ve `mark` kutularının yerine bir düzlem gelir, dokusu `pixelTexture(8, 12)` ile çizilir (zemin `colors[0]`, `motifPixels` dikdörtgenleri `colors[1]`). `films[i]` yoksa düzlem düz `#2a2440` olur, motif çizilmez. Çerçeve renkleri taslaktaki gibi kalır.
- [ ] **Step 2: Commit takvimi.** Tech bölgesinin parçasıdır (tıklayınca Tech açılır). Arka duvarda rafın üstünde, ortası `(3.45, 3.6, -3.975)`, 0.9×0.5 boyutunda, +z'ye bakan bir düzlem; arkasında koyu çerçeve kutusu. Doku `pixelTexture(13, 7)`; seviye renkleri `['#2a2440', '#2f5a3a', '#3f8a4a', '#5fc05a', '#a0ff8a']`.
- [ ] **Step 3: CV dosyası.** `zone('cv', 'CV')`. Masanın sol önü, `(0.4, 1.49, -3.05)`: 0.42×0.03×0.32 `#e8c060` dosya, üstünde biraz kaymış 0.36×0.01×0.28 beyaz kâğıt.
- [ ] **Step 4: Telefon.** `zone('contact', 'Contact')`. Sol duvarda atari makinesinin üstü, ortası `(-3.95, 3.0, -2.3)`: 0.08×0.4×0.25 `#c04040` gövde, önünde 0.1×0.36×0.08 `#d05050` ahize, altında birkaç küçük kutudan kablo.
- [ ] **Step 5: Doğrula.** `npm run build`, ardından `h=12` ve `h=20` ekran görüntüleri: afişlerde motifler görünüyor, takvim ızgara olarak seçiliyor, dosya ve telefon görünür ve bir şeyi kapatmıyor. Sonra yerelde `favorites.json`'da yalnızca 2 film bırak, derle, ekran görüntüsü al: üçüncü çerçeve boş, konsolda hata yok. Dosyayı geri al, bu değişikliği commit'leme.
- [ ] **Step 6: Commit** — `git add src/scene && git commit -m "Posters from favorites, commit calendar, CV file and phone in the room"`

---

### Task 9: Etkileşim: üstüne gelme, tıklama, kamera, saat rozeti, ipucu

**Files:**
- Create: `src/scene/pick.js`, `src/ui/clock.js`
- Modify: `src/scene/index.js`, `src/main.js`, `index.html`, `src/style.css`

**Interfaces:**
- Consumes: `initPanels` → `{ navigate, home }` (Task 6); `start()` (Task 7); `formatHour`, `localHour`, `parseRoute`.
- Produces:
  ```js
  // src/scene/pick.js
  export function initPick(stage, renderer, cam, root, onPick /* (zone) => void */)
  // start(stage, data, { hour, reducedMotion, onPick }) → { setHour(h | null), flyTo(zone) → Promise<void>, flyHome() → Promise<void> }
  // src/ui/clock.js
  export function initClock(onChange /* (h | null) => void */) // shows the badge; call once the scene is live
  ```

- [ ] **Step 1: `pick.js`.** Taslağın 439–467. satırlarından alınır. Işın kökün çocuklarına atılır; bölge üst gruplara çıkılarak bulunur. Parlama: emissive'e `#262626` eklenir. `stage` içinde bir `.tip` etiketi `userData.label`'ı gösterir; etiket ve parlama yalnızca `pointerType === 'mouse'` iken çalışır. Bölgenin üstünde imleç `pointer` olur. Tıklama ya da dokunma → `onPick(zone)`.
- [ ] **Step 2: Kamera uçuşu.** `flyTo(zone)`: hedef `new Box3().setFromObject(zoneGroup).getCenter()`, kamera hedefe göre `(12.25, 10, 12.25)` uzaklığını korur, zoom 1 → 2.2; 700 ms easeInOutCubic; bitince söz çözülür. `flyHome()`: hedef `(0, 1.6, 0)`, zoom 1. Uçuş sürerken yeni uçuş, o anki konumdan başlar. `reducedMotion`'da anında atlar. Bölgeler adla bulunur (`cv` ve `contact` dahil).
- [ ] **Step 3: Bağla (`main.js`).** `initPanels({ onOpen: r => scene?.flyTo(r), onClose: () => scene?.flyHome() })`; `start(…, { onPick: r => { hideHint(); panels.navigate(r); } })`. Sahne hazır olduğunda `parseRoute(location.hash)` doluysa (paylaşılan bağlantı, panel zaten açık) `scene.flyTo(route)` çağrılır.
- [ ] **Step 4: Saat rozeti.** `index.html`'e `<button id="clock" class="clock" hidden aria-expanded="false" aria-controls="clock-pop"></button>` ve `<div id="clock-pop" hidden><label>Time <input type="range" min="0" max="23.95" step="0.05"></label><button type="button">Now</button></div>` eklenir. Rozet sağ altta, `formatHour(hour ?? localHour())` gösterir; saat izlenirken 30 saniyede bir yenilenir. Tıklayınca açılır pencere açılır/kapanır. Kaydırıcı → `onChange(value)`; Now → `onChange(null)` ve pencere kapanır; açılır penceredeyken Esc kapatır. `main.js`: sahne hazır olunca `initClock(h => scene.setHour(h))`.
- [ ] **Step 5: İpucu.** `index.html`'e `<p id="hint" class="hint" hidden>Click around the room</p>` eklenir (altta ortada). Sahne hazır olduğunda `localStorage.hintSeen` yoksa görünür. İlk `onPick`'te ya da ilk menü tıklamasında gizlenir ve bayrak yazılır. Okuma da yazma da `try/catch` içinde.
- [ ] **Step 6: Doğrula.** `npm run build`; `--url "/?h=20#/games"` ekran görüntüsü: kamera oyun köşesine yakın, panel açık. Elle (`npm run dev`): üstüne gelince parlama ve etiket; tıklayınca uçuş ve panel; Esc geri uçuş; rozet kaydırıcısı ışığı değiştiriyor, Now geri getiriyor; tarayıcıda azaltılmış hareket açıkken uçuş anında.
- [ ] **Step 7: Commit** — `git add src index.html && git commit -m "Hover, click-to-fly, clock badge and first-visit hint"`

---

### Task 10: Odanın rutini ve son resim

**Files:**
- Modify: `src/scene/kit.js`, `src/scene/games.js`, `src/scene/tech.js`, `src/scene/cinema.js`, `package.json`, `public/room.png`

**Interfaces:**
- Consumes: `tick(s, routine, motion)` (Task 7); `routineAt` (Task 1).
- Produces: `kit.steam(x, y, z, parent) → { group, tick(s) }`

- [ ] **Step 1: Buhar.** `kit.steam`: 4 küçük (0.05) beyaz, saydam kutu; 2 saniyede 0.4 yükselir, giderek solar, fazları kaydırılmıştır. Görünürlüğü çağıran köşe belirler.
- [ ] **Step 2: Rutin.** Davranışlar:
  - **morning** (tech): kahve kupasının üstünde buhar `(2.55, 1.7, -2.95)`. Kod satırları yazılır: satır `i`'nin `scale.x`'i sırayla 0→1 olur (satır başına ~0.5 s, 7 satırdan sonra 2 s bekleyip baştan). Sabah dışında satırlar tam ve sabit.
  - **evening** (games): TV açık, oyun oynanıyor. Emissive her 0.4 s'de `['#c03a78', '#3ac0a0', '#e0c040', '#4060d0']` arasında değişir, üstüne taslağın titremesi; `tvLight` açık. Atari makinesi tanıtım ekranında: taslaktaki renk dönüşü + üst şeritte 1 Hz yanıp sönme. Akşam dışında atari ekranı sabit `#205040`.
  - **night** (games + cinema): TV'de film. Ekranın üstünde ve altında iki siyah bant (1.8×0.17×0.01) görünür; emissive ~8 s'lik döngüyle `#304060` ile `#806040` arasında yavaşça kayar. Mısırın üstünde buhar `(-3.0, 0.65, 2.9)`.
  - Akşam ve gece dışında TV kapalı: emissive `#000000`, `tvLight` 0.
  - **afternoon**: ek bir şey yok.
  - `motion === false`: buhar gizli, kod satırları tam, TV ilk renginde sabit, yanıp sönme yok.
  - Gece ışıkların kısılması `time.js`'teki anahtar karelerden gelir (Task 1); burada kod yok.
- [ ] **Step 3: Doğrula.** `npm run build`; `h=8`, `h=14`, `h=20`, `h=1` ekran görüntüleri: buhar ve yarım kod satırları; sakin oda; TV'de renkli oyun; bantlı film ve mısır buharı.
- [ ] **Step 4: Son resim.** `package.json`'a `"snapshot": "node scripts/snapshot.mjs"` ekle. Run: `npm run build && node scripts/snapshot.mjs --url "/?h=20&snapshot" --size 1200,630 --out public/room.png`. Resme bak, sonra yeniden `npm run build`.
- [ ] **Step 5: Commit** — `git add src package.json public/room.png && git commit -m "Daily room routine and final still image"`

---

### Task 11: Günlük yayın akışı, eski dosyalar, README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (baştan)
- Delete: `docs/_config.yml`, `docs/_data/`, `docs/_includes/`, `docs/_layouts/`, `docs/assets/`, `docs/index.html`, `docs/portfolio.md`, `docs/cv.md`, `NOTES.md`

- [ ] **Step 1: İş akışını yaz** — `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  push:
    branches: [master]
  schedule:
    - cron: '17 3 * * *'
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: node scripts/fetch-github.mjs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: npm run build
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```
Herhangi bir adım başarısız olursa yayın yapılmaz, site dünkü haliyle kalır. Actions'ın sürümleri yazıldığı gün daha yeni bir ana sürüme geçtiyse yenisini kullan.

- [ ] **Step 2: Eski dosyaları kaldır** — `git rm -r docs/_config.yml docs/_data docs/_includes docs/_layouts docs/assets docs/index.html docs/portfolio.md docs/cv.md NOTES.md`
- [ ] **Step 3: README.** Kısa, İngilizce: yerelde çalıştırma (`npm install`, `npm run dev`, `npm test`); içerik düzenleme (`content/` dosyaları, alanları, `[PLACEHOLDER]`); bir depoyu siteye koymak (GitHub'da `portfolio-games|tech|cinema` konusu); yerelde gerçek veri (`GITHUB_TOKEN=$(gh auth token) node scripts/fetch-github.mjs`); sahne değişince sabit resmi yenilemek (Task 10, adım 4'teki komut). Uyarı: GitHub, depoda 60 gün hareket olmazsa zamanlanmış iş akışlarını kapatır; Actions sekmesinden yeniden açılır.
- [ ] **Step 4: Doğrula.** Run: `npm ci && npm test && npm run build` → temiz. Run (Git Bash): `CI=true npm run build` (`data/github.json` yokken) → `data/github.json missing` hatasıyla durur.
- [ ] **Step 5: Commit** — `git add -A .github README.md docs NOTES.md && git commit -m "Daily deploy workflow; remove the old Jekyll site"`

---

### Task 12: Yayına alma (Liffrey'nin onayıyla)

- [ ] **Step 1: DUR ve sor.** Liffrey'ye şunu açıkla ve açık bir "evet" bekle: (a) Pages kaynağı "GitHub Actions" olacak, (b) `portfolio-room` dalı `master`'a birleştirilip push edilecek. Yayındaki eski Jekyll sitesinin yerini yeni oda alacak. Konu etiketi olmayan depolar görünmeyecek; köşeler, Liffrey GitHub'da etiket ekleyene kadar yalnızca ekstra projeleri gösterecek.
- [ ] **Step 2: Pages kaynağını değiştir.** Run: `gh api -X PUT repos/Liffrey/liffrey.github.io/pages -f build_type=workflow`, sonra `gh api repos/Liffrey/liffrey.github.io/pages --jq .build_type`. Expected: `workflow`.
- [ ] **Step 3: Birleştir ve gönder.** Run: `git checkout master && git merge --ff-only portfolio-room && git push origin master`.
- [ ] **Step 4: İzle.** Run: `gh run watch --exit-status` (Deploy çalıştırması). Expected: başarılı. `https://liffrey.github.io` odayı açıyor; `#/tech` paneli ve takvim gerçek veriyle dolu.
- [ ] **Step 5: Yalnızca GraphQL adımı Actions anahtarıyla başarısız olursa.** Spec'teki yedek yolu ekle: `src/lib/calendar.js`'e `eventDays(events, today, n = 90) → [{ date, count }]` (son 90 gün, artan sırada, `PushEvent` `payload.size` günlük toplanır). Testleri: aynı gündeki iki push toplanır; 90 günden eski olay sayılmaz; dönüş 90 kalemdir. `fetch-github.mjs` GraphQL hata verdiğinde `GET /users/<u>/events/public?per_page=100&page=1..3`'ü kullanır. Ardından commit, push, yeniden izle. (Platane/snk aynı sorguyu `GITHUB_TOKEN` ile çalıştırıyor; bu adımın gerekmemesi beklenir.)
