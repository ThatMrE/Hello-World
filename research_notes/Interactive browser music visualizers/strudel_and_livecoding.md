# Strudel.cc and the Browser Live-Coding Visual Ecosystem (as of late 2026)

Scope note: target is a **static, vanilla HTML/CSS/JS site, no build step, no npm, on Netlify**, with a cross-origin Bandcamp iframe for album playback (whose audio is **not** analysable) — so Strudel is the only candidate reactive audio source. All licence claims below were verified by reading actual `LICENSE` files and npm package metadata, not blog posts.

Version baseline observed during this research (npm `latest`): `@strudel/repl` **1.3.0**, `@strudel/web` **1.3.0**, `@strudel/webaudio` **1.3.0**, `@strudel/core` / `@strudel/draw` / `@strudel/hydra` / `@strudel/transpiler` / `@strudel/mini` **1.2.6**, `superdough` **1.3.0**, `@strudel/embed` **1.1.2**, `hydra-synth` **1.4.0**, `tone` **15.1.22**.

---

## Q1. Strudel embedding: what are the actual options?

### Takeaway
Strudel documents **five** integration routes, and **four of them are explicitly buildless plain-HTML `<script>`/`<iframe>` approaches**: iframe embed of strudel.cc, the `@strudel/embed` (`<strudel-repl>`) iframe web component, the `@strudel/repl` (`<strudel-editor>`) in-page web component, and `@strudel/web` (`initStrudel()`) for your own UI. Only the à-la-carte `@strudel/*` npm route needs a bundler, because those packages ship raw ES modules with no UMD build.

### Cited Findings

**Route 1 — iframe embedding of strudel.cc (no bundler).** The docs give a share-URL iframe and a self-contained long-URL iframe that encodes the code in the hash. Verbatim from the docs:
```html
<iframe src="https://strudel.cc/?xwWRfuCE8TAR" width="600" height="300"></iframe>
```
```html
<iframe
  src="https://strudel.cc/#c2V0Y3BzKDEpCm4oIjwwIDEgMiAzIDQ%2BKjgiKS5zY2FsZSgnRzQgbWlub3InKQoucygiZ21fbGVhZF82X3ZvaWNlIikKLmNsaXAoc2luZS5yYW5nZSguMiwuOCkuc2xvdyg4KSkKLmp1eChyZXYpCi5yb29tKDIpCi5zb21ldGltZXMoYWRkKG5vdGUoIjEyIikpKQoubHBmKHBlcmxpbi5yYW5nZSgyMDAsMjAwMDApLnNsb3dNCkp"
  width="600" height="300"></iframe>
```
The docs warn that short share links "depend on a database that may not be permanent" and recommend the long (hash-encoded) URL for a durable copy; the long URL is copyable straight from the strudel.cc address bar — [Strudel docs, Project Start](https://strudel.cc/technical-manual/project-start/)

**Route 2 — `@strudel/embed` / `<strudel-repl>` web component (no bundler).** Loads the Strudel *site* inside an iframe; code goes inside HTML comments so the browser doesn't parse it as markup:
```html
<script src="https://unpkg.com/@strudel/embed@latest"></script>
<strudel-repl>
  <!--
setcps(1)
n("<0 1 2 3 4>*8").scale('G4 minor')
.s("gm_lead_6_voice")
.clip(sine.range(.2,.8).slow(8))
.jux(rev)
.room(2)
.sometimes(add(note("12")))
.lpf(perlin.range(200,20000).slow(4))
-->
</strudel-repl>
```
— [Strudel docs, Project Start](https://strudel.cc/technical-manual/project-start/). npm description for the package: "Embeddable Web Component to load a Strudel REPL into an iframe", v1.1.2, licence `AGPL-3.0-or-later`, entry `embed.js` — [npm registry, @strudel/embed](https://registry.npmjs.org/@strudel/embed/latest)

**Route 3 — `@strudel/repl` / `<strudel-editor>` web component (no bundler, runs in-page, no iframe).** Verbatim from the package README:
```html
<script src="https://unpkg.com/@strudel/repl@latest"></script>
```
```html
<strudel-editor>
  <!--
setcps(1)
n("<0 1 2 3 4>*8").scale('G4 minor')
.s("gm_lead_6_voice")
.clip(sine.range(.2,.8).slow(8))
.jux(rev)
.room(2)
.sometimes(add(note("12")))
.lpf(perlin.range(200,20000).slow(4))
-->
</strudel-editor>
```
Version pinning is explicitly recommended: `<script src="https://unpkg.com/@strudel/repl@1.0.2"></script>` — "This has the advantage that your code will always work, regardless of potential breaking changes in the strudel codebase." — [@strudel/repl README via jsDelivr](https://cdn.jsdelivr.net/npm/@strudel/repl@1.3.0/README.md)

The same README documents **creating the component from JS and driving it programmatically**:
```html
<script src="https://unpkg.com/@strudel/repl@latest"></script>
<div id="strudel"></div>
<script>
  const repl = document.createElement('strudel-editor');
  repl.setAttribute('code', `setcps(1)
n("<0 1 2 3 4>*8").scale('G4 minor')
.s("gm_lead_6_voice")
...`);
  document.getElementById('strudel').append(repl);
  console.log(repl.editor);
</script>
```
"The `.editor` property on the `strudel-editor` web component gives you the instance of StrudelMirror that runs the REPL. For example, you could use `setCode` to change the code from the outside, `start` / `stop` to toggle playback or `evaluate` to evaluate the code." — [@strudel/repl README](https://cdn.jsdelivr.net/npm/@strudel/repl@1.3.0/README.md)

`@strudel/repl` v1.3.0's published file list includes a prebuilt UMD-ish entry `dist/index.js` (npm `main`), plus `dist/index.mjs` (`module`), and notably a bundled **`dist/hydra-C4R5I71T.js`** chunk — i.e. Hydra is bundled into the REPL component — [jsDelivr file listing, @strudel/repl@1.3.0](https://data.jsdelivr.com/v1/package/npm/@strudel/repl@1.3.0/flat)

**Route 4 — `@strudel/web` + `initStrudel()` (no bundler, your own UI).** This is the "bring your own buttons" bundle. Verbatim from both the docs and the package README:
```html
<!doctype html>
<script src="https://unpkg.com/@strudel/web@1.0.3"></script>
<button id="play">play</button>
<button id="stop">stop</button>
<script>
  initStrudel();
  document.getElementById('play').addEventListener('click', () => note('<c a f e>(3,8)').jux(rev).play());
  document.getElementById('stop').addEventListener('click', () => hush());
</script>
```
"As soon as you call `initStrudel()`, all strudel functions are made available." The README explicitly says "Save this code as a `.html` file and double click it" — i.e. it works from `file://`, let alone Netlify. It also warns: "Due to the Autoplay policy, you can only play audio in a browser after a click event." — [@strudel/web README](https://cdn.jsdelivr.net/npm/@strudel/web@1.3.0/README.md); [Strudel docs, Project Start](https://strudel.cc/technical-manual/project-start/)

`@strudel/web` extras documented in its README:
- Sample loading: `initStrudel({ prebake: () => samples('github:tidalcycles/dirt-samples') });`
- Runtime string evaluation (behaves like the REPL, including mini-notation in double quotes): `evaluate('note("c a f e").jux(rev)')`
- Quoting caveat: in `@strudel/web` double quotes are *not* auto-interpreted as mini-notation, so `"1 2 3".slow(2)` fails; use `evaluate()`, or `m("1 2 3").slow(2)`, or a control function `n("1 2 3").slow(2)`.
— [@strudel/web README](https://cdn.jsdelivr.net/npm/@strudel/web@1.3.0/README.md)

**Route 5 — individual `@strudel/*` npm packages (bundler required).** "All Strudel packages are published on npm under the `@strudel` namespace. You can install only the parts you need." Because these are ES modules, the docs say you need a bundler that supports them, such as Vite — [Strudel docs, Project Start](https://strudel.cc/technical-manual/project-start/)

**What each package does** (npm `description` fields, all licence `AGPL-3.0-or-later`):
| Package | Version | Description | npm `main` |
|---|---|---|---|
| `@strudel/core` | 1.2.6 | "Port of Tidal Cycles to JavaScript" (Pattern, Hap, controls, scheduler) | `dist/index.mjs` |
| `@strudel/mini` | 1.2.6 | "Mini notation for strudel" | `dist/index.mjs` |
| `@strudel/transpiler` | 1.2.6 | "Transpiler for strudel user code. Converts syntactically correct but semantically meaningless JS into evaluatable strudel code." | `dist/index.mjs` |
| `@strudel/webaudio` | 1.3.0 | "Web Audio helpers for Strudel" (re-exports `superdough`, `scope`, `spectrum`) | `dist/index.mjs` |
| `superdough` | 1.3.0 | the actual Web Audio synth/sampler engine + AudioContext + analyser plumbing | `dist/index.mjs` |
| `@strudel/draw` | 1.2.6 | "Helpers for drawing with Strudel" (pianoroll, punchcard, spiral, pitchwheel, canvas) | `dist/index.mjs` |
| `@strudel/hydra` | 1.2.6 | "Hydra integration for strudel" | `dist/index.mjs` |
| `@strudel/codemirror` | 1.3.0 | "Codemirror Extensions for Strudel" (StrudelMirror editor) | `dist/index.mjs` |
| `@strudel/soundfonts` | 1.3.0 | "Soundsfont support for strudel" | `dist/index.mjs` |
| `@strudel/repl` | 1.3.0 | "Strudel REPL as a Web Component" | `dist/index.js` (+ `module: dist/index.mjs`) |
| `@strudel/web` | 1.3.0 | "Easy to setup, opiniated bundle of Strudel for the browser." | `dist/index.js` (+ `module: dist/index.mjs`) |
— [npm registry metadata for each package](https://registry.npmjs.org/@strudel/core/latest)

Crucially, **only `@strudel/repl` and `@strudel/web` publish a non-ESM `main` (`dist/index.js`)**; every other `@strudel/*` package and `superdough` publish `dist/index.mjs` as `main`, with no `unpkg`, no `browser`, and (per the registry metadata read here) **no `exports` map** — [npm registry metadata](https://registry.npmjs.org/@strudel/core/latest)

**Repository has moved.** Source headers inside the published packages point at `https://codeberg.org/uzu/strudel/...`, and the npm `repository.url` for `superdough` and `@strudel/codemirror` is `git+https://codeberg.org/uzu/strudel.git` — [superdough npm metadata](https://registry.npmjs.org/superdough/latest); [@strudel/codemirror npm metadata](https://registry.npmjs.org/@strudel/codemirror/latest). Search results confirm `github.com/tidalcycles/strudel` is now a public archive labelled "MOVED TO CODEBERG", with development at `codeberg.org/uzu/strudel`, and that the project remains AGPLv3 — [web search summary of tidalcycles/strudel and codeberg.org/uzu/strudel](https://codeberg.org/necrophcodr/strudel). A GitHub API call for `tidalcycles/strudel` was blocked in this session, but `raw.githubusercontent.com/tidalcycles/strudel/main/LICENSE` still serves content (HTTP 200), consistent with an archived-but-present mirror.

### Inferences
- For a hand-written static site, the ranked practical choices are: **`@strudel/web`** (maximum control, your own UI, your own canvas, no editor chrome), **`<strudel-editor>`** (full REPL in-page, same-origin, so its AudioContext and canvas are reachable from your page), **`<strudel-repl>`/raw iframe** (zero risk, zero access — sandboxed cross-document).
- `@strudel/repl`'s `dist/index.js` being the npm `main` plus the docs' own `<script src="https://unpkg.com/@strudel/repl@latest">` example means unpkg's default-file resolution serves a classic script that self-registers the custom element. The same holds for `@strudel/web` (`initStrudel` lands on `window`).
- Because the docs themselves recommend pinning (`@1.0.2` in their example), and because the live versions are now 1.3.0, pinning is the right call for a site you won't babysit — unpinned `@latest` has already moved through at least a minor version since that doc example was written.

### Gaps
- The exact list of attributes `<strudel-editor>` accepts beyond `code` (e.g. `sync`, `solo`, `hideHeader`, theme) is not documented in the README or the Project Start page; only `code` is shown. Would need to read `packages/repl/repl-component.mjs` on Codeberg to enumerate them.
- No documented way to make `<strudel-repl>`'s iframe expose its audio (it is a cross-document iframe of strudel.cc, so by construction it cannot).

---

## Q2. Strudel licensing — verified from source

### Takeaway
**Strudel is AGPL-3.0 (specifically `AGPL-3.0-or-later`), verified both in the repo's `LICENSE` file and in every single `@strudel/*` npm package's `license` field.** This is the single most consequential fact for this project: bundling/serving Strudel's code from your own site is network-interactive distribution under AGPL §13, which obliges you to offer the complete corresponding source of the *whole* work to your users. Iframe-embedding the hosted strudel.cc is materially different and does **not** trigger that obligation.

### Cited Findings
- The repository `LICENSE` file (661 lines) begins verbatim:
  ```
                      GNU AFFERO GENERAL PUBLIC LICENSE
                         Version 3, 19 November 2007

   Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
   Everyone is permitted to copy and distribute verbatim copies
   of this license document, but changing it is not allowed.
  ```
  — [tidalcycles/strudel LICENSE (raw)](https://raw.githubusercontent.com/tidalcycles/strudel/main/LICENSE). (Note: `LICENSE.md`, `LICENSE.txt` and `COPYING` all 404; the file is plain `LICENSE`, present on both `main` and `master`.)
- Every package checked reports `"license": "AGPL-3.0-or-later"` in npm metadata: `@strudel/core` 1.2.6, `@strudel/repl` 1.3.0, `@strudel/webaudio` 1.3.0, `@strudel/transpiler` 1.2.6, `@strudel/draw` 1.2.6, `@strudel/hydra` 1.2.6, `@strudel/web` 1.3.0, `@strudel/mini` 1.2.6, `@strudel/soundfonts` 1.3.0, `@strudel/codemirror` 1.3.0, `@strudel/embed` 1.1.2, and the underlying `superdough` 1.3.0 — [npm registry](https://registry.npmjs.org/@strudel/repl/latest)
- Per-file headers inside the shipped sources repeat the licence inline, e.g. `@strudel/webaudio/index.mjs`: "This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version." — [@strudel/webaudio@1.3.0/index.mjs](https://cdn.jsdelivr.net/npm/@strudel/webaudio@1.3.0/index.mjs)
- Strudel's own documentation states the implication plainly: "Strudel is AGPL-3.0. Distributing a website that includes Strudel generally means sharing the whole application's source under the same or a compatible license, and that applies to derivative clones too." — [Strudel docs, Project Start](https://strudel.cc/technical-manual/project-start/)
- Independent confirmation that the licence is unchanged after the Codeberg move: "The project remains under the GNU Affero Public Licence v3." — [web search summary of codeberg.org/uzu/strudel README](https://codeberg.org/necrophcodr/strudel)

### Inferences
These are legal *inferences*, not legal advice, and the user should treat them as such:
- **Loading `@strudel/web` or `@strudel/repl` from unpkg/jsDelivr into your own page is still conveying Strudel to your users over a network.** The CDN is a delivery mechanism, not a licence firewall. AGPL §13 ("Remote Network Interaction") is triggered by users *interacting with the program remotely through a computer network*, and the AGPL's copyleft reaches the work you combine it with. The conservative, standard-practice answer: if Strudel runs as part of your page, publish the source of your page under AGPL-3.0-or-later and give users a prominent source offer (a link to a public repo is the usual satisfaction). For a personal site that is already hand-written vanilla HTML/CSS/JS with no secrets, this is cheap — your source is essentially already readable, and a public Git repo plus a licence notice discharges it.
- **Iframe-embedding hosted strudel.cc is categorically different.** You are not distributing or conveying Strudel at all; the user's browser fetches and runs strudel.cc from the Strudel project's own server, under the Strudel project's own AGPL obligations (which they discharge by publishing their source). Your page merely contains a hyperlink-equivalent. Linking to / framing an AGPL web app has never been held to make the linking page a derivative work. So **`<iframe src="https://strudel.cc/#...">` imposes no licence obligation on your site.** This is also what the docs' own framing implies, since they present the licence warning in the context of *including* Strudel.
- **`@strudel/embed` / `<strudel-repl>` sits on the iframe side of that line** — the component itself is a tiny AGPL loader script you'd be serving, but the Strudel engine runs inside strudel.cc's iframe. The one script you'd be distributing is `@strudel/embed`'s `embed.js`; to be clean you'd still be serving an AGPL file. Pure hand-written `<iframe>` with no `@strudel/embed` script avoids even that.
- **The reciprocity is one-directional and harmless for a personal music site.** AGPL does not prevent you using Strudel commercially, on a portfolio, or alongside a Bandcamp embed. It only requires source availability. The genuine incompatibility risk would be if the user wanted the site's source to be proprietary or under a permissive licence — then the in-page routes are out and the iframe route is the only option.

### Gaps
- No authoritative statement from the Strudel maintainers on whether they consider framing strudel.cc to trigger anything (they don't appear to address it; the Project Start licence note addresses *including* Strudel). The inference above is based on the text of AGPL-3.0 §13 and conventional interpretation, not on a maintainer ruling or case law.
- `@strudel/web`'s published bundle may vendor dependencies with other licences (e.g. CodeMirror is MIT, `fraction.js` etc.); a full bundled-dependency licence audit was not performed.

---

## Q3. Audio access: AudioContext and AnalyserNode

### Takeaway
Strudel's AudioContext is a **singleton** managed by `superdough` and exposed as `getAudioContext()` (re-exported from `@strudel/webaudio`), with a matching `setAudioContext(ctx)` that lets you **inject your own AudioContext** before Strudel creates one. Strudel **does ship its own analyser machinery** — `analyze` and `fft` are registered pattern controls, `getAnalyserById()` creates real `AnalyserNode`s, and `getAnalyzerData('time'|'frequency', id)` returns `Float32Array` data — so you mostly don't need to build your own tap.

### Cited Findings

**AudioContext singleton** — complete source of `superdough/audioContext.mjs`:
```js
let audioContext;

export const setDefaultAudioContext = () => {
  audioContext = new AudioContext();
  return audioContext;
};

export const setAudioContext = (context) => {
  audioContext = context;
  return audioContext;
};

export const getAudioContext = () => {
  if (!audioContext) {
    return setDefaultAudioContext();
  }
  return audioContext;
};

export function getAudioContextCurrentTime() {
  return getAudioContext().currentTime;
}
```
— [superdough@1.3.0/audioContext.mjs](https://cdn.jsdelivr.net/npm/superdough@1.3.0/audioContext.mjs)

`superdough/index.mjs` re-exports `./audioContext.mjs` (and `superdough.mjs`, `sampler.mjs`, `helpers.mjs`, `synth.mjs`, `zzfx.mjs`, `logger.mjs`, `modulators.mjs`, `dspworklet.mjs`, `wavetable.mjs`), and `@strudel/webaudio/index.mjs` in turn does `export * from 'superdough';` alongside `./webaudio.mjs`, `./scope.mjs`, `./spectrum.mjs`, `./supradough.mjs` — [superdough@1.3.0/index.mjs](https://cdn.jsdelivr.net/npm/superdough@1.3.0/index.mjs); [@strudel/webaudio@1.3.0/index.mjs](https://cdn.jsdelivr.net/npm/@strudel/webaudio@1.3.0/index.mjs)

**`initAudio` and `initAudioOnFirstClick` exist** as exported async functions in `superdough/superdough.mjs` (lines 259 and 307 respectively) — [grep of superdough@1.3.0/superdough.mjs](https://cdn.jsdelivr.net/npm/superdough@1.3.0/superdough.mjs). `@strudel/webaudio/webaudio.mjs` imports `getAudioContext` and `initAudio` from superdough and uses them in `renderPatternAudio()` and `webaudioRepl()`, where `const audioContext = options.audioContext ?? getAudioContext();` — [@strudel/webaudio@1.3.0/webaudio.mjs](https://cdn.jsdelivr.net/npm/@strudel/webaudio@1.3.0/webaudio.mjs)

**Strudel's built-in analyser — `analyze` and `fft` are real pattern controls.** From `@strudel/core/controls.mjs`:
```js
// analyser node send amount 0 - 1 (used by scope)
export const { analyze } = registerControl('analyze');
// fftSize of analyser
export const { fft } = registerControl('fft');
```
— [@strudel/core@1.2.6/controls.mjs](https://cdn.jsdelivr.net/npm/@strudel/core@1.2.6/controls.mjs)

**The analyser pool, in `superdough/superdough.mjs`:**
```js
export let analysers = {}, analysersData = {};

export function getAnalyserById(id, fftSize = 1024, smoothingTimeConstant = 0.5) {
  if (!analysers[id] || analysers[id].context != getAudioContext()) {
    const analyserNode = getAudioContext().createAnalyser();
    analyserNode.fftSize = fftSize;
    analyserNode.smoothingTimeConstant = smoothingTimeConstant;
    // getDestination().connect(analyserNode);
    analysers[id] = analyserNode;
    analysersData[id] = new Float32Array(analysers[id].frequencyBinCount);
  }
  if (analysers[id].fftSize !== fftSize) {
    analysers[id].fftSize = fftSize;
    analysersData[id] = new Float32Array(analysers[id].frequencyBinCount);
  }
  return analysers[id];
}

export function getAnalyzerData(type = 'time', id = 1) {
  const getter = {
    time: () => analysers[id]?.getFloatTimeDomainData(analysersData[id]),
    frequency: () => analysers[id]?.getFloatFrequencyData(analysersData[id]),
  }[type];
  if (!getter) {
    throw new Error(`getAnalyzerData: ${type} not supported. use one of ${Object.keys(getter).join(', ')}`);
  }
  ...
  return analysersData[id];
}
```
— [superdough@1.3.0/superdough.mjs](https://cdn.jsdelivr.net/npm/superdough@1.3.0/superdough.mjs)

**How the analyser is wired per-voice, not globally.** In the same file, the per-event signal chain does:
```js
// analyser
if (analyze && !(ac instanceof OfflineAudioContext)) {
  const analyserNode = getAnalyserById(analyze, 2 ** (fft + 5));
  const analyserSend = effectSend(post, analyserNode, 1);
  chain.audioNodes.push(analyserSend);
}
```
with `fft = getDefaultValue('fft')` and the defaults table containing `fft: 8`. Note the commented-out `// getDestination().connect(analyserNode);` in `getAnalyserById`. — [superdough@1.3.0/superdough.mjs](https://cdn.jsdelivr.net/npm/superdough@1.3.0/superdough.mjs)

Default `fft: 8` ⇒ `fftSize = 2 ** (8 + 5) = 8192` ⇒ `frequencyBinCount = 4096`. `getAnalyserById`'s own default when called directly is `fftSize = 1024`, `smoothingTimeConstant = 0.5`.

### Inferences
- **Does Strudel ship its own analyser? Yes, fully.** You get `AnalyserNode`s for free via `.analyze(id)` on any pattern, plus `getAnalyzerData('time'|'frequency', id)` to read `Float32Array` time-domain or dB frequency-domain data, plus the raw nodes via the exported `analysers` object (`analysers[1]` etc.). You do **not** need to construct your own `AnalyserNode` for a visualiser — but you can, since `getAudioContext()` hands you the real `AudioContext`.
- **Important architectural nuance:** `analyze` is a *per-voice wet send* (`effectSend(post, analyserNode, 1)`), not a tap on the master destination — and the line that would have connected the destination to the analyser is commented out. So `analysers[1]` only receives sound from events that actually carry `.analyze(1)`. For a whole-mix visualiser on a custom page you have two choices: (a) put `.analyze(1)` on every pattern (or use `all(x => x.analyze(1))`), or (b) create your own `AnalyserNode` on `getAudioContext()` and insert it at the destination yourself.
- **Two clean recipes for a buildless custom page** (both inferred from the verified APIs above, not copied from docs):
  - *Use Strudel's own analyser:* after `initStrudel()`, play a pattern with `.analyze(1)` appended, then in a `requestAnimationFrame` loop call `getAnalyzerData('frequency', 1)` / `getAnalyzerData('time', 1)` and draw into your own canvas. With `@strudel/web`'s global namespace these functions are on `window`.
  - *Bring your own AudioContext:* call `setAudioContext(myCtx)` *before* anything triggers `getAudioContext()`, so you own the graph and can insert an `AnalyserNode` wherever you want. (Ordering matters: the singleton lazily self-creates on first `getAudioContext()`.)
- Because `getAudioContext()` creates a bare `new AudioContext()` and browsers start it `suspended`, the Autoplay-policy warning in the `@strudel/web` README is the operative constraint: your visualiser must be gated behind a user gesture. `initAudioOnFirstClick` exists in superdough for exactly this.
- **The Bandcamp constraint is confirmed-by-construction:** a cross-origin iframe's audio never reaches your `AudioContext` (no `MediaElementSource` can be created across origins, and the iframe has its own audio graph). Strudel being same-origin/in-page is precisely what makes it analysable. The iframe-embed route for Strudel would put Strudel in the *same* un-analysable bucket as Bandcamp.

### Gaps
- `initAudioOnFirstClick`'s exact options object was not read (only its existence and position at line 307 of `superdough.mjs` were confirmed). Its signature in the source is `export async function initAudioOnFirstClick(options)`.
- Whether `@strudel/web`'s `initStrudel()` puts `getAudioContext`, `getAnalyzerData`, `analysers` and `setAudioContext` on `window` was not directly verified — the README only says "all strudel functions are made available", and `@strudel/web/index.mjs` was not retrievable from jsDelivr (only the built `dist/` is published). This should be confirmed in the browser console before committing to recipe (a).
- No documented, user-facing page covers `analyze`/`fft` as controls; they appear only in source comments. `strudel.cc/learn/synths/` does not mention `analyze`, `fft` or `analyser` at all (it only uses `_scope()` in examples) — [Strudel docs, Synths](https://strudel.cc/learn/synths/)

---

## Q4. Strudel's own visual facilities

### Takeaway
Strudel's visuals are documented on one page and implemented in `@strudel/draw` (pattern-structure visuals) and `@strudel/webaudio` (audio-signal visuals). They all draw into a **2D canvas obtained from `getDrawContext()`**, which by default **creates and prepends a full-screen `position:fixed; pointer-events:none` canvas to `document.body`** — and critically, **you can supply your own canvas**, either by putting `<canvas id="test-canvas">` on the page or by passing `{ ctx }` in the options. That makes them usable outside the REPL.

### Cited Findings

**The canvas surface — complete source of `getDrawContext`:**
```js
export const getDrawContext = (id = 'test-canvas', options) => {
  let { contextType = '2d', pixelated = false, pixelRatio = window.devicePixelRatio } = options || {};
  let canvas = document.querySelector('#' + id);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style = 'pointer-events:none;width:100%;height:100%;position:fixed;top:0;left:0';
    pixelated && (canvas.style.imageRendering = 'pixelated');
    document.body.prepend(canvas);
    let timeout;
    window.addEventListener('resize', () => { /* resize to window */ });
  }
  return canvas.getContext(contextType, { willReadFrequently: true });
};
```
— [@strudel/draw@1.2.6/draw.mjs](https://cdn.jsdelivr.net/npm/@strudel/draw@1.2.6/draw.mjs)

**The animation driver — `Pattern.prototype.draw(fn, options)`** runs a `requestAnimationFrame` loop, keeps a `memory[id]` of haps filtered by `lookbehind`/`lookahead`, queries the pattern for the elapsed arc each frame (`let begin = Math.max(last || t, t - 1/10); // inactive tab throttles to 1fps`) and calls `fn(memory[id], _t, t, this)`. `cleanupDraw(clearScreen = true, id)` clears the canvas and cancels animations. — [@strudel/draw@1.2.6/draw.mjs](https://cdn.jsdelivr.net/npm/@strudel/draw@1.2.6/draw.mjs)

**`@strudel/draw/index.mjs` exports exactly:** `animate.mjs`, `color.mjs`, `draw.mjs`, `pianoroll.mjs`, `spiral.mjs`, `pitchwheel.mjs` — [@strudel/draw@1.2.6/index.mjs](https://cdn.jsdelivr.net/npm/@strudel/draw@1.2.6/index.mjs)

**Global vs. inline `_` convention (documented):** "No prefix (e.g. `punchcard`): renders to the page background. `_` prefix (e.g. `_punchcard`): renders inside the code, allowing multiple visuals." — [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

**`pianoroll` / `punchcard`.** The source docstring: "Visualises a pattern as a scrolling 'pianoroll', displayed in the background of the editor. To show a pianoroll for all running patterns, use `all(pianoroll)`. To have a pianoroll appear below a pattern instead, prefix with `_`, e.g.: `sound("bd sd")._pianoroll()`." `@name pianoroll`, `@synonyms punchcard`. Implementation: `Pattern.prototype.pianoroll = function (options = {}) { let { cycles = 4, playhead = 0.5, overscan = 0, hideNegative = false, ctx = getDrawContext(), id = 1 } = options; ... }`, and `Pattern.prototype.punchcard = function (options) { return this.onPaint(getPunchcardPainter(options)); }`. There is also `Pattern.prototype.wordfall = function (options) { return this.punchcard({ vertical: 1, labels: 1, stroke: 0, fillActive: 1, active: 'white', ...options }); }` ("Displays a vertical pianoroll with event labels. Supports all the same options as pianoroll.") — [@strudel/draw@1.2.6/pianoroll.mjs](https://cdn.jsdelivr.net/npm/@strudel/draw@1.2.6/pianoroll.mjs)

The docs distinguish them behaviourally: "`pianoroll` draws the pattern directly. `punchcard` also reflects transformations applied afterward, and it's less resource-intensive because it reuses mini-notation highlighting data." Documented options: `cycles` (default 4), `playhead` (0.5), `vertical`, `labels`, `flipTime`, `flipValues`, `fill`, `stroke`, `active`/`inactive` colours, `minMidi` (10), `maxMidi` (90), `autorange`. Example verbatim:
```
note("c a f e").color("white")
._punchcard()
.color("cyan")
```
```
note("c2 a2 eb2")
.euclid(5,8)
.s('sawtooth')
.lpenv(4).lpf(300)
.pianoroll({ labels: 1 })
```
— [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

**`scope` / `tscope` — time-domain oscilloscope.** Source docstring: "Renders an oscilloscope for the time domain of the audio signal. `@name scope`, `@synonyms tscope`", options `align` (default 1, "the scope will be aligned to the first zero crossing"), `color` (white), `thickness` (3), `scale` (0.25), `pos` ("y-position relative to screen height. 0 = top, 1 = bottom"), `trigger` (0). Example: `s("sawtooth")._scope()`. Implementation:
```js
Pattern.prototype.tscope = function (config = {}) {
  let id = config.id ?? 1;
  return this.analyze(id).draw(
    (haps) => {
      config.color = haps[0]?.value?.color || getTheme().foreground;
      latestColor[id] = config.color;
      clearScreen(config.smear, '0,0,0', config.ctx);
      drawTimeScope(analysers[id], config);
    },
    { id },
  );
};
Pattern.prototype.scope = Pattern.prototype.tscope;
```
Note `this.analyze(id)` — **`.scope()` silently adds the analyser send for you.** `drawTimeScope` reads `getAnalyzerData('time', id)`, iterates `analyser.frequencyBinCount`, and draws a polyline; if `analyser` is undefined (no sound played yet) it draws a flat line. — [@strudel/webaudio@1.3.0/scope.mjs](https://cdn.jsdelivr.net/npm/@strudel/webaudio@1.3.0/scope.mjs)

**`fscope` — frequency-domain scope.** "Renders an oscilloscope for the frequency domain of the audio signal. `@name fscope`", options `color`, `scale` (0.25), `pos`, `lean` ("y-axis alignment where 0 = top and 1 = bottom"), `min` (-150), `max` (0). Example: `s("sawtooth").fscope()`. `drawFrequencyScope` reads `getAnalyzerData('frequency', id)` and `ctx.fillRect`s a bar per bin, normalising `(dataArray[i] - min) / (max - min)` clamped 0–1. — [@strudel/webaudio@1.3.0/scope.mjs](https://cdn.jsdelivr.net/npm/@strudel/webaudio@1.3.0/scope.mjs)

**`spectrum` — scrolling spectrogram.** "Renders a spectrum analyzer for the incoming audio signal. `@name spectrum`", options `thickness` (3px), `speed` (1 = scroll speed), `min` (-80 dB), `max` (0 dB). It is a true scrolling spectrogram: each frame it does `ctx.putImageData(imageData, -scrollSize, 0)` to shift the previous frame left, then draws a new column of pixels at `q = canvas.width - speed`, with vertical position on a log scale (`Math.log(i + 1) / Math.log(bufferSize) * canvas.height`) and `ctx.globalAlpha = normalized`. Also `.analyze(id)`-wrapped. Documented example verbatim:
```
n("<0 4 <2 3> 1>*3")
.off(1/8, add(n(5)))
.off(1/5, add(n(7)))
.scale("d3:minor:pentatonic")
.s('sine')
.dec(.3).room(.5)
._spectrum()
```
— [@strudel/webaudio@1.3.0/spectrum.mjs](https://cdn.jsdelivr.net/npm/@strudel/webaudio@1.3.0/spectrum.mjs); [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

**`spiral`.** Options: `stretch`, `size`, `thickness`, `cap`, `inset`, `playheadColor`, `playheadLength`, `padding`, `steady`, `activeColor`, `inactiveColor`, `colorizeInactive`, `fade`, `logSpiral`. Example `._spiral({ steady: .96 })` — [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

**`pitchwheel`.** "Renders a pitch circle showing frequencies within one octave." Options: `hapcircles`, `circle`, `edo`, `root`, `thickness`, `hapRadius`, `mode`, `margin` (docs give no descriptions). Example:
```
n("0 .. 12").scale("C:chromatic")
.s("sawtooth")
.lpf(500)
._pitchwheel()
```
— [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

**`color` and `markcss`.** `color` "sets the color of events and can be patterned, e.g. `.color("cyan magenta")`. It also affects how events appear in the visuals above." `markcss` "overrides the CSS of highlighted events. Use single quotes", e.g. `note("c a f e").markcss('text-decoration:underline')`. Mini-notation highlighting works inline in the editor on anything in double quotes or backticks. — [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

**`print` / `_print`** also exist: without `_` output goes to the console panel labelled by position (e.g. `[print(line:1)]`); with `_` it renders a scrollable widget in the code. Options `width` (600px), `height` (100px), `maxLines` (500) for `_print` only, plus `round` (4) and `padding` (3). — [Strudel docs, Visual Feedback](https://strudel.cc/learn/visual-feedback/)

### Inferences
- **Yes, these work outside the REPL on a custom page**, with two caveats confirmed from source:
  1. The **global** (no-underscore) variants target `getDrawContext()`, i.e. the canvas with `id="test-canvas"`. If you place `<canvas id="test-canvas">` yourself, Strudel will use *your* canvas and skip creating its own fullscreen fixed one — this is the hook for compositing visuals into your own layout. Alternatively pass `{ ctx: myCanvas.getContext('2d') }` in the options object, which `pianoroll`, `drawTimeScope`, `drawFrequencyScope` and `drawSpectrum` all accept.
  2. The **`_`-prefixed inline** variants render *inside the code editor* widget. They are a CodeMirror/StrudelMirror feature, so they only make sense with `<strudel-editor>` (or strudel.cc), **not** with `@strudel/web`. On a custom-UI page you want the un-prefixed forms.
- The default canvas style (`position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none`) plus `document.body.prepend()` means Strudel's visuals land **behind** your HTML content by DOM order and never steal clicks — which is exactly the "composite behind HTML content" behaviour the project wants, for free. You'd control stacking with `z-index` on your own content if needed.
- `.scope()`, `.fscope()` and `.spectrum()` all call `this.analyze(id)` internally, which means **using them is the easiest way to guarantee the analyser send exists** — and once it does, `analysers[1]` / `getAnalyzerData(...)` are live for your *own* custom visualiser too. Practical trick: add `.analyze(1)` (or `._scope()` on a hidden canvas) and then draw your own thing from `getAnalyzerData('frequency', 1)`.
- The `id` option on every visual maps to the analyser pool key, so multiple independent visuals/analysers can coexist (`.analyze(1)`, `.analyze(2)`, …).

### Gaps
- `@strudel/draw/animate.mjs` and `color.mjs` were not read in detail; `animate()` appears to be a general-purpose per-frame hook but its signature is unverified.
- The docs page shows some garbled example text (`.Ⅰ_pianoroll()`, `.\_spiral(...)`) — markdown-escaping artefacts in the rendered page rather than real syntax. Correct forms are `._pianoroll()`, `._spiral()`, `._scope()`, `._spectrum()`, `._pitchwheel()`.
- `getPunchcardPainter` / `onPaint` internals (how punchcard reuses mini-notation highlight data) were not read.

---

## Q5. Strudel + Hydra, and Hydra standalone

### Takeaway
Strudel's Hydra integration is one line — `await initHydra()` at the top of a pattern — and it accepts any `hydra-synth` constructor option, including `{detectAudio:true}` for Hydra's own mic/audio FFT. Hydra is **also AGPL-3.0**, in both the editor repo and the `hydra-synth` library, so it adds no *new* licence problem on top of Strudel — but it is equally copyleft. `hydra-synth` loads perfectly from a plain CDN script tag as a UMD global `Hydra` and renders to a canvas you supply, which is exactly what's needed for compositing behind HTML.

### Cited Findings

**Strudel's documented Hydra integration.** "Call `await initHydra()` at the top of your code to enable Hydra. You can write Hydra code directly in Strudel." Any option from the hydra-synth API can be passed to `initHydra`. "To use Hydra's audio capture, call `initHydra` with the configuration parameter `{detectAudio:true}`." "The special function `H` takes a Strudel pattern and uses it as an input to Hydra." The `feedStrudel` option "lets you transform Strudel's visualizations with Hydra". Example (decoded from the docs' REPL link):
```javascript
await initHydra()
let pattern = "3 4 5 [6 7]*2"
shape(H(pattern)).out(o0)
n(pattern).scale("A:minor").piano().room(1)
```
— [Strudel docs, Hydra](https://strudel.cc/learn/hydra/)

**`@strudel/hydra` npm package:** v1.2.6, licence `AGPL-3.0-or-later`, description "Hydra integration for strudel", `main: dist/index.mjs` (ESM only, no `unpkg`) — [npm registry, @strudel/hydra](https://registry.npmjs.org/@strudel/hydra/latest). Hydra is **already bundled into `@strudel/repl`** — its published files include `dist/hydra-C4R5I71T.js` — [jsDelivr file listing, @strudel/repl@1.3.0](https://data.jsdelivr.com/v1/package/npm/@strudel/repl@1.3.0/flat)

**Hydra licences (verified).**
- `hydra-synth/hydra` (the editor) `LICENSE` is verbatim "GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007" — [hydra-synth/hydra LICENSE (raw)](https://raw.githubusercontent.com/hydra-synth/hydra/main/LICENSE)
- `hydra-synth/hydra-synth` (the library) `LICENSE` is likewise "GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007", and its `package.json` has `"license": "AGPL"` (v1.4.0, author `ojack`) — [hydra-synth LICENSE (raw)](https://raw.githubusercontent.com/hydra-synth/hydra-synth/main/LICENSE); [hydra-synth package.json (raw)](https://raw.githubusercontent.com/hydra-synth/hydra-synth/main/package.json). GitHub's own repo page lists it under AGPL-3.0 — [hydra-synth/hydra-synth README](https://github.com/hydra-synth/hydra-synth)
- npm metadata: `hydra-synth@1.4.0`, `"license": "AGPL"`, `"unpkg": "./dist/hydra-synth.js"`, build script `browserify ./src/index.js -p esmify --standalone Hydra > dist/hydra-synth.js` — i.e. a **UMD bundle exposing a global `Hydra`** — [npm registry, hydra-synth](https://registry.npmjs.org/hydra-synth/latest); [hydra-synth package.json](https://raw.githubusercontent.com/hydra-synth/hydra-synth/main/package.json)

**Standalone CDN usage, verbatim from the hydra-synth README** ("Include the bundled version of this library in your html file"):
```html
<script src="https://unpkg.com/hydra-synth"></script>
<script>
  // create a new hydra-synth instance
  var hydra = new Hydra({ detectAudio: false })
  osc(4, 0.1, 1.2).out()
</script>
```
Constructor options documented there:
- `canvas` — "canvas element to render to. If none is supplied, a canvas will be created and appended to the screen"
- `width` — "defaults to canvas width when included, 1280 if not"
- `height` — "defaults to canvas height when included, 720 if not"
- `autoLoop` — "if true, will automatically loop using requestAnimationFrame"
- `makeGlobal` — "if false, will not pollute global namespace (note: there are currently bugs with this)"
- `detectAudio` — "recommend setting this to false to avoid asking for microphone"
- `precision` — "force precision of shaders, can be 'highp', 'mediump', or 'lowp' (recommended for ios)"
— [hydra-synth README](https://github.com/hydra-synth/hydra-synth)

**Hydra's audio API (`a`), from the official docs.** "FFT functions are accessed through the audio object `a`. The editor uses the **Meyda** library for analysis."
- `a.show()` displays the FFT bins; `a.hide()` hides the audio waveform.
- `a.setBins(6)` sets the number of FFT bins (frequency bands).
- `a.fft[0]` returns the value of the leftmost, lowest-frequency bin; "Values range from 0 to 1, where 0 is the cutoff and 1 is the maximum."
- `a.setCutoff(4)` sets the minimum level detected.
- `a.setScale(2)` sets the range of levels detected.
- `a.setSmooth(0.8)` sets smoothing between readings from 0 to 1; "Lower values react faster and jumpier. A value of 1 means the value never changes."

Examples verbatim:
```javascript
osc(10, 0, () => a.fft[0]*4)
  .out()
```
```javascript
a.setBins(5)
noise(2)
  .modulate(o0, () => a.fft[1]*.5)
  .out()

a.setSmooth(.8)
a.setScale(8)
a.setCutoff(0.1)
a.show()
// a.hide()
render(o0)
```
— [Hydra docs, Audio](https://hydra.ojack.xyz/docs/docs/learning/sequencing-and-interactivity/audio/)

### Inferences
- **Licence compatibility: yes, trivially.** AGPL-3.0 + AGPL-3.0 combine fine. Hydra adds nothing new to the obligation set beyond what Strudel already imposes. (`hydra-synth`'s `package.json` says the non-SPDX string `"AGPL"` rather than `AGPL-3.0`, which is sloppy metadata, but the `LICENSE` file is unambiguously AGPLv3, and the file governs.)
- **For a buildless static site, standalone `hydra-synth` from unpkg is the strongest visual engine available**, because: (a) UMD global, no bundler; (b) `canvas` option means you pass in your own `<canvas>` and position/z-index it behind your HTML with ordinary CSS, exactly the compositing the project wants; (c) `autoLoop: true` handles the render loop; (d) `makeGlobal: false` avoids namespace pollution — though the README itself warns there are currently bugs with it, so the safe choice on a personal site is to leave `makeGlobal` default and accept the globals.
- **Feeding Hydra Strudel's audio — three distinct options, in order of robustness:**
  1. *Inside Strudel:* `await initHydra({ detectAudio: true })` and use `a.fft[n]` in Hydra expressions. This is the documented path, but `detectAudio` in Hydra means **microphone capture** (hence the README's "recommend setting this to false to avoid asking for microphone"). On a public web page that triggers a mic permission prompt, which is bad UX for a music portfolio and will mostly be denied. Caveat worth flagging to the user.
  2. *Hand the numbers across yourself:* run `hydra-synth` standalone, run Strudel via `@strudel/web`, and drive Hydra parameters from `getAnalyzerData('frequency', 1)` using Hydra's function-arguments feature (`osc(10, 0, () => myBass * 4)`). Hydra's docs show every numeric parameter accepts a function, so this needs no Hydra audio support at all and no mic. **This is the cleanest route on a static site** and sidesteps both the mic prompt and the Meyda dependency.
  3. *Strudel pattern → Hydra:* `H(pattern)` passes a Strudel pattern (structure, not audio) as a Hydra input. Good for rhythm-locked visuals, not amplitude/spectrum-reactive ones.
- Since `@strudel/repl` already bundles Hydra, using `<strudel-editor>` gets you `initHydra()` with zero extra script tags; using `@strudel/web` probably does not (it is described as an "opiniated bundle" and its dependency list was not inspected), so standalone `hydra-synth` from unpkg is the predictable choice there.

### Gaps
- The docs give no code example for `feedStrudel` or for `detectAudio` in the Strudel context, so its exact semantics (does `feedStrudel` route Strudel's `test-canvas` into Hydra as a texture source?) are unverified.
- Whether Strudel's `initHydra({detectAudio:true})` taps **Strudel's own output bus** rather than the microphone is unverified and is the key open question for route 1. Hydra's own `detectAudio` is documented as microphone-based (Meyda on an input stream). If Strudel rewires it to its internal destination this would be much more attractive; nothing read here confirms that.
- `enableStreamCapture` was not covered in the README content retrieved.
- `hydra-synth@1.4.0`'s `main` is `./src/index.js` (raw ESM source) — only the `unpkg`/`require` path points at the browserified `dist/hydra-synth.js`. So `https://unpkg.com/hydra-synth` resolves via the `unpkg` field to the UMD bundle, but `https://cdn.jsdelivr.net/npm/hydra-synth` (which prefers `main`) may resolve to raw source. **Pin the explicit path** — `https://unpkg.com/hydra-synth@1.4.0/dist/hydra-synth.js` — rather than trusting default resolution. (Inference from the package.json fields; not tested in a browser here.)

---

## Q6. Adjacent live-coding / synthesis tools

### Takeaway
**Tone.js is the only major option here that is permissively licensed (MIT)** and it ships first-class analyser classes plus a UMD CDN build — making it the natural fallback if the AGPL obligation is unacceptable. Gibber is MIT but shows no evidence of recent core maintenance. Glicol is MIT. Flok and Estuary are collaborative *editors/platforms*, not embeddable visual libraries.

### Cited Findings

**Tone.js — MIT, v15.1.22.** npm metadata: `"license": "MIT"`, `"main": "build/esm/index.js"`, and crucially `"unpkg": "build/Tone.js"` — a UMD build exposing the `Tone` global, loadable from a plain script tag — [npm registry, tone](https://registry.npmjs.org/tone/latest). Description: "A Web Audio framework for making interactive music in the browser." Repo `github.com/Tonejs/Tone.js`.

**`Tone.Analyser`** (official docs): "A wrapper around the native Web Audio `AnalyserNode`. Extracts FFT or Waveform data from the incoming signal."
- Constructors: `new Analyser(type?, size?)` where `type` is `"fft"` or `"waveform"` and `size` "must be a power of two from 16 to 16384"; or `new Analyser(options?)`.
- `getValue()`: "Run the analysis with the current settings." Returns a `Float32Array` with one channel, or an array of `Float32Array`s (one per channel) with more.
- Properties: `type` (`"fft"`|`"waveform"`) and `size`, both readable/settable; `smoothing` ("time averaging against the previous frame, where 0 means none"); `channels` (channel separation done with `Split`).
- Connecting: use `connect()` or `chain()` to feed signal in; `toDestination()` to send to the context's destination (`toMaster()` deprecated). The node carries a `context` property of type `BaseContext`.
— [Tone.js docs, Analyser (v15.1.22)](https://tonejs.github.io/docs/15.1.22/classes/Analyser.html)

**Gibber — MIT, but maintenance unclear.** `gibber-cc/gibber/package.json` reports `name: gibber`, `version: 0.0.1`, `license: MIT`, and a `LICENSE` file exists on both `main` and `master` — [gibber-cc/gibber package.json (raw)](https://raw.githubusercontent.com/gibber-cc/gibber/master/package.json). Charlie Roberts's GitHub profile describes him as primary developer of gibber, gibberish and genish, with `gibber-cc/gibber` ("an audiovisual live coding environment for the browser") among his pinned projects — [github.com/charlieroberts](https://www.github.com/charlieroberts). In a November 2025 Future of Coding thread he posted about a new small editor library, `teeny`, and linked a wasm audio playground at `gibber.cc/genish/playground` — [Future of Coding devlog, Nov 2025 W4](https://history.futureofcoding.org/history/weekly/2025/11/W4/devlog-together.html). Searches surfaced **no dated 2025 commit history or release notes for the core Gibber repo**; `gibber-cc/gibberish` has no `LICENSE` at `main` or `master` (both 404).

**Glicol — MIT.** npm `glicol@0.4.0`, `"license": "MIT"`, description: "A light-weight, audio-thread-GC-free, memory-safe, and easy-to-use audio engine for browser-based music apps." Repo `github.com/chaosprint/glicol`. No `unpkg` field; `main: index.js` — [npm registry, glicol](https://registry.npmjs.org/glicol/latest)

**Estuary** — "a browser-based platform for live coding that allows a heterogeneous collection of live coding languages to be used together in collaborative 'ensembles'", in development since 2015; base languages include MiniTidal, Punctual, CineCer0, TimeNot, Seis8s and **Hydra**; "you don't need to install or build anything to start using Estuary", though one source notes Chrome/Chromium are required; a public test server is hosted at McMaster University — [Estuary 0.3 paper, Zenodo](https://zenodo.org/record/6767377); [dktr0/estuary](https://github.com/dktr0/estuary)

**Flok** — "Web-based P2P collaborative editor for live coding music and graphics", "similar to Etherpad, but focused on code evaluation for livecoding", with multiple separate slots for different languages/tools; runnable locally via `npx flok-web@latest`; hosted at flok.cc. Note it has **also moved to Codeberg** (`codeberg.org/munshkr/flok`) — [codeberg.org/munshkr/flok](https://codeberg.org/munshkr/flok); [munshkr.github.io/flok](https://munshkr.github.io/flok)

### Inferences
- **Tone.js is the escape hatch if AGPL is a dealbreaker.** MIT + UMD CDN build + built-in `Tone.Analyser` means you can build a fully reactive audio-visual page with no copyleft obligation and no build step: `<script src="https://unpkg.com/tone@15.1.22/build/Tone.js"></script>`, then `const analyser = new Tone.Analyser('fft', 1024); synth.connect(analyser); ... analyser.getValue()`. The trade-off is that Tone.js gives you a synthesis framework, not Tidal's pattern language — you'd be hand-writing sequencing rather than writing `n("<0 1 2 3>*8")`.
- **Gibber should not be recommended for a 2026 production site.** MIT is fine, but the absence of discoverable recent core commits/releases, the missing LICENSE in the sibling `gibberish` repo, and `version: 0.0.1` all point to a research project rather than a maintained dependency. Roberts's current energy appears to be on `genish`/`teeny`.
- **Flok and Estuary are the wrong shape for this task.** They're collaborative performance *platforms* you'd link to or perform in, not libraries you embed in a portfolio page. Worth a one-line mention in a report as ecosystem context, not as implementation candidates.
- Glicol is MIT and interesting as a lightweight Rust/WASM audio engine, but it has no analyser/visual story documented here and no UMD field, so it does not beat Tone.js for the buildless constraint.

### Gaps
- `Tone.FFT`, `Tone.Waveform` and `Tone.Meter` were not individually verified — the `Analyser` docs page retrieved does not cover them. From Tone.js's documented structure they are thin subclasses/wrappers of `Analyser`, but their exact constructor signatures should be confirmed against `tonejs.github.io/docs/15.1.22/`.
- `Tone.getContext()` / `.rawContext` (the documented way to reach the underlying native `AudioContext`, needed to share a context with Strudel via `setAudioContext()`) was **not** confirmed on the page retrieved; the page only exposes a `context: BaseContext` property. This matters if the user ever wants Strudel and Tone.js in one graph.
- **Sema**: searches returned nothing identifiable. I found **no reliable sources** on Sema's current state, licence, or maintenance, and cannot report on it. (Sema was a Goldsmiths/MIMIC-project live-coding-plus-machine-learning environment, but nothing in these search results substantiates its 2026 status, so I am treating it as unverified.)
- No licence verified for Estuary or Flok.

---

## Q7. Practical reality check: what survives "static site, no build step, Netlify"?

### Takeaway
Four of Strudel's five routes survive, plus standalone Hydra and Tone.js. Only the à-la-carte `@strudel/*` npm packages force a bundler. The real decision is not technical feasibility but **licence posture**: everything that gives you analysable audio is AGPL; the only thing that's licence-free is the iframe, and the iframe gives you no audio.

### Cited Findings
| Approach | Buildless? | Evidence | Audio analysable from your page? |
|---|---|---|---|
| `<iframe src="https://strudel.cc/#<base64>">` | **Yes** | docs show plain HTML [Project Start](https://strudel.cc/technical-manual/project-start/) | **No** — cross-origin document |
| `@strudel/embed` → `<strudel-repl>` | **Yes** — `<script src="https://unpkg.com/@strudel/embed@latest">` | [Project Start](https://strudel.cc/technical-manual/project-start/) | **No** — loads strudel.cc in an iframe |
| `@strudel/repl` → `<strudel-editor>` | **Yes** — `<script src="https://unpkg.com/@strudel/repl@latest">`; npm `main: dist/index.js` | [README](https://cdn.jsdelivr.net/npm/@strudel/repl@1.3.0/README.md); [npm](https://registry.npmjs.org/@strudel/repl/latest) | **Yes** — runs in-page, no iframe; `.editor` exposed |
| `@strudel/web` → `initStrudel()` | **Yes** — "Save this code as a `.html` file and double click it"; npm `main: dist/index.js` | [README](https://cdn.jsdelivr.net/npm/@strudel/web@1.3.0/README.md) | **Yes** — same page, same AudioContext |
| individual `@strudel/*` packages | **No** | "Because these are ES modules, you need a bundler... such as Vite"; every package's `main` is `dist/index.mjs` with no `unpkg`/`browser`/`exports` | n/a |
| `hydra-synth` standalone | **Yes** — `<script src="https://unpkg.com/hydra-synth">`, UMD global `Hydra` (`--standalone Hydra`) | [README](https://github.com/hydra-synth/hydra-synth); [package.json](https://raw.githubusercontent.com/hydra-synth/hydra-synth/main/package.json) | via its own `a.fft` (mic) or functions you supply |
| `tone` standalone | **Yes** — npm `unpkg: build/Tone.js` | [npm](https://registry.npmjs.org/tone/latest) | **Yes** — `Tone.Analyser` |
| Bandcamp iframe | **Yes** | — | **No** — cross-origin, by design |

Autoplay constraint applies to every audio route: "Due to the Autoplay policy, you can only play audio in a browser after a click event." — [@strudel/web README](https://cdn.jsdelivr.net/npm/@strudel/web@1.3.0/README.md)

### Inferences
- **Recommended stack for this project, if AGPL is acceptable:** `@strudel/web` pinned from unpkg (`https://unpkg.com/@strudel/web@1.3.0`) for audio + patterns, with your own play/stop buttons; `.analyze(1)` on the patterns; your own `requestAnimationFrame` loop reading `getAnalyzerData('frequency'|'time', 1)`; optionally `hydra-synth@1.4.0/dist/hydra-synth.js` pinned from unpkg rendering into a `<canvas>` you own, positioned behind your HTML, with Hydra parameters fed from those analyser values as thunks (`() => bassLevel`). Site source published under AGPL-3.0-or-later with a visible link to the repo. This is entirely static-hostable on Netlify — it's just HTML plus two CDN script tags.
- **Easiest "it just works" option:** `<strudel-editor>` from `@strudel/repl` pinned. You get the full REPL, mini-notation highlighting, `._scope()`/`._pianoroll()` inline visuals, and bundled Hydra, in two lines of HTML. Downside: you inherit the REPL's visual design, and the `_`-prefixed inline visuals only make sense inside that editor.
- **Zero-obligation option:** hand-written `<iframe src="https://strudel.cc/#...">` with the long hash-encoded pattern (not the short share link, which depends on a database the docs say "may not be permanent"). Costs you all audio reactivity — the iframe is as opaque as the Bandcamp one. If the whole point is a reactive visualiser, this route defeats the purpose.
- **Licence-free *and* reactive** is only reachable by dropping Strudel for Tone.js (MIT). That's the genuine fork in the road, and it should be presented as such: Tidal-style pattern language + AGPL, versus MIT + hand-rolled sequencing.
- Pin every CDN URL to an exact version. The docs' own example pins `@strudel/repl@1.0.2` while live is 1.3.0, and `@strudel/web@1.0.3` while live is 1.3.0 — the project does ship breaking changes, and an unattended static site with `@latest` will eventually break silently. For `hydra-synth`, pin the full path to `dist/hydra-synth.js` because `main` points at raw ESM source.
- Netlify adds no constraints: all of this is static files plus third-party CDN fetches. The only server-side consideration is that if you want to self-host the scripts instead of hitting unpkg (sensible for longevity), you're definitively distributing AGPL code from your own domain — which strengthens, not changes, the source-offer conclusion above.

### Gaps
- Not tested in a live browser: whether `@strudel/web`'s globals include `getAnalyzerData` / `analysers` / `setAudioContext`, and whether `https://unpkg.com/hydra-synth` (bare, no path) reliably serves the UMD bundle. Both should be confirmed in a console before writing final code.
- Whether `<strudel-editor>` can be made visually unobtrusive (hidden editor, visuals only) is undocumented — no attribute list was found.
