# Open-source, in-browser music/audio visualizers with retrievable source code (as of late 2026)

Scope note on verification method: every licence below was verified by reading the project's
`LICENSE`/`LICENSE.md` file over `raw.githubusercontent.com`, by npm registry `license` metadata,
or by GitHub's own sidebar licence label — each cited inline. Where those sources disagree, or
where no licence file exists, that is flagged explicitly. File sizes come from the jsDelivr
package-file API (`data.jsdelivr.com/v1/packages/npm/...`), i.e. the actual published bytes, not
from README claims. The GitHub REST API was unavailable in this environment (`api.github.com`
returned "GitHub access to this repository is not enabled for this session"), so last-commit dates
are mostly unverified; npm publish dates are used as the activity proxy and are labelled as such.

---

## Q1. What are the best-known and best-maintained open-source web audio visualizers? (catalogue)

### Takeaway
Six projects are genuinely drop-in for a static vanilla site with no build step and a verified
permissive licence: **butterchurn + butterchurn-presets** (MIT, WebGL Milkdrop), **wavesurfer.js**
(BSD-3-Clause, waveform/spectrogram), **Wave.js/@foobar404/wave** (MIT, canvas 2D + some WebGL-free
3D-ish modes), **Vanta.js** (MIT, WebGL backgrounds but *not* audio-reactive out of the box),
**Vissonance** (MIT, three.js spectrum scenes) and **clubber.js** (MIT, audio→shader-uniform
feature extractor). The single most polished analyser, **audioMotion-analyzer**, is **AGPL-3.0-or-later**,
which is the one big licence landmine in this space. **Vudio.js** has a licence conflict (npm says
MIT, the upstream GitHub repo has no LICENSE file at all).

### Cited Findings

**butterchurn — WebGL Milkdrop 2 reimplementation**
- Repo: https://github.com/jberg/butterchurn — GitHub sidebar shows "MIT license"; README states "This project is licensed under the MIT License"; ~2.0k stars, 205 commits — [GitHub repo page](https://github.com/jberg/butterchurn)
- Licence verified by reading the file: `LICENSE` begins "MIT License / Copyright (c) 2013-2018 Jordan Berg" — [raw LICENSE](https://raw.githubusercontent.com/jberg/butterchurn/master/LICENSE)
- Visual: described by its own repo as "a WebGL implementation of the Milkdrop Visualizer" — swirling, feedback-warped, bloom-heavy fullscreen fractal/plasma fields driven by per-preset equations; requires **WebGL 2**, and the README ships an `isSupported` helper — [GitHub repo page](https://github.com/jberg/butterchurn); [jsDelivr package page](https://www.jsdelivr.com/package/npm/butterchurn)
- **Audio input: accepts an arbitrary Web Audio node.** README usage is `visualizer.connectAudio(audioNode)` with the note "get audioNode from audio source or microphone" — i.e. it takes a node the page already owns, not a file or `<audio>` element — [GitHub repo page](https://github.com/jberg/butterchurn)
- **No build step needed.** The published `lib/butterchurn.min.js` is a webpack UMD bundle whose browser-global branch is `t.butterchurn=e()`, so a plain `<script>` tag yields `window.butterchurn`. Same for presets: `a.butterchurnPresets=e()` → `window.butterchurnPresets` — verified by fetching the first 400 bytes of https://cdn.jsdelivr.net/npm/butterchurn@2.6.7/lib/butterchurn.min.js and https://cdn.jsdelivr.net/npm/butterchurn-presets@2.4.7/lib/butterchurnPresets.min.js
- Sizes (jsDelivr file API, `butterchurn@2.6.7`): `lib/butterchurn.min.js` **188.0 KB**, `lib/butterchurn.js` 323.2 KB, `lib/butterchurnExtraImages.min.js` 194.1 KB, `lib/isSupported.min.js` 1.4 KB; npm `unpackedSize` 728,442 bytes (~711 KB) — jsDelivr `data.jsdelivr.com/v1/packages/npm/butterchurn@2.6.7` and `registry.npmjs.org/butterchurn`
- npm latest version is **2.6.7, published 2019-03-12** (`dist-tags.latest` + `time`), `main`/`unpkg` both point at `lib/butterchurn.js` — [npm registry metadata](https://registry.npmjs.org/butterchurn)
- Maintenance: no evidence of a maintained fork with 2026 releases was found; an index snapshot reports the repo's last push as 2024-03-18, and Webamp ships a `webamp/butterchurn` entrypoint from v2.2.0 onward — [search of forks/Webamp docs](https://docs.webamp.org/docs/features/mikdrop); snapshot via [awesome.ecosyste.ms project record](https://awesome.ecosyste.ms/projects/github.com%2Fjberg%2Fbutterchurn)

**butterchurn-presets — the Milkdrop preset packs**
- Licence verified by reading the file: `LICENSE` is "MIT License / Copyright (c) 2013-2018 Jordan Berg" — [raw LICENSE](https://raw.githubusercontent.com/jberg/butterchurn-presets/master/LICENSE); npm metadata also reports `license: MIT` — [npm registry](https://registry.npmjs.org/butterchurn-presets)
- Pack files and sizes (jsDelivr, `butterchurn-presets@2.4.7`): `butterchurnPresets.min.js` **638.3 KB**, `butterchurnPresetsExtra.min.js` **825.0 KB**, `butterchurnPresetsExtra2.min.js` 595.3 KB, `butterchurnPresetsNonMinimal.min.js` 456.3 KB, `butterchurnPresetsMD1.min.js` 277.5 KB, `butterchurnPresetsMinimal.min.js` **187.0 KB**, `butterchurnPresetPackMeta.min.js` 28.9 KB. Individual presets also ship as JSON under `/presets/converted/*.json` (5–13 KB each). npm `unpackedSize` is **11,894,293 bytes (~11.3 MB)** — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/butterchurn-presets@2.4.7?structure=flat); [npm registry](https://registry.npmjs.org/butterchurn-presets)
- npm latest is **2.4.7, published 2018-06-09**; `main`/`unpkg` = `lib/butterchurnPresets.min.js` — [npm registry](https://registry.npmjs.org/butterchurn-presets)

**audioMotion-analyzer — spectrum analyser (THE licence trap)**
- Repo: https://github.com/hvianna/audioMotion-analyzer — **AGPL-3.0**. Verified by reading the file: `LICENSE` is the verbatim "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007" — [raw LICENSE](https://raw.githubusercontent.com/hvianna/audioMotion-analyzer/master/LICENSE). npm declares `AGPL-3.0-or-later` — [npm registry](https://registry.npmjs.org/audiomotion-analyzer). The repo footer says "Licensed under the GNU Affero General Public License, version 3 or later", copyright Henrique Avila Vianna 2018–2026 — [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer)
- Visual: mode 0 = discrete FFT frequencies; modes 1–8 = octave-fraction bands (1/24 octave/240 bands down to full octave/10 bands); mode 10 = line/filled-area graph. Effects include LED bars, luminance bars, outlined and rounded bars, reflection, and a **radial spectrum**. Scales: logarithmic, linear, Bark, Mel. 5 built-in gradients plus custom registration — [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer)
- **Audio input: accepts an arbitrary AudioNode.** The `source` option and `connectInput()` method take "an HTMLMediaElement or an AudioNode (or any of its descendants)"; `connectOutput()` routes onward; you can pass your own `AudioContext` via the `audioCtx` option. (The docs do not name `AnalyserNode` explicitly, but an AnalyserNode is an AudioNode.) — [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer)
- **No build step.** Published as native ESM (`cdn.jsdelivr.net/npm/audiomotion-analyzer@4/+esm`) and as a global script (`cdn.jsdelivr.net/npm/audiomotion-analyzer@4`); `dist/index.js` is a UMD wrapper that sets `global.AudioMotionAnalyzer = mod.exports.default` — verified by fetching the first 400 bytes of https://cdn.jsdelivr.net/npm/audiomotion-analyzer@4.5.4/dist/index.js
- Size: `dist/index.js` is **93.4 KB** unminified; README claims "~30kB minified"; **zero dependencies**; npm `unpackedSize` 300,827 bytes — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/audiomotion-analyzer@4.5.4?structure=flat); [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer)
- **Best-maintained of the lot**: npm latest **4.5.4, published 2026-01-09**; 985 stars — [npm registry](https://registry.npmjs.org/audiomotion-analyzer); [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer)

**wavesurfer.js**
- Repo: https://github.com/katspaugh/wavesurfer.js — **BSD-3-Clause**, verified by reading the file: "BSD 3-Clause License / Copyright (c) 2012-2023, katspaugh and contributors" — [raw LICENSE](https://raw.githubusercontent.com/katspaugh/wavesurfer.js/main/LICENSE); GitHub sidebar also shows "BSD-3-Clause license"; 10.5k stars — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js)
- Visual: "an interactive waveform rendering and audio playback library" — static/scrubbable waveforms, plus a **Spectrogram plugin** giving "visualization of an audio frequency spectrum" with a `rendering: 'windowed'` option for long files; also minimap and regions plugins — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js)
- **Audio input: file/URL-oriented, not an arbitrary AudioNode.** It takes `url: '/audio.mp3'` (fetched and decoded with Web Audio, CORS applies), or pre-decoded `peaks` + `duration` for streaming, and it can be connected into a Web Audio graph "by exporting its audio element". The README explicitly says it isn't meant to be a general Web Audio wrapper, and taking an existing `AudioNode`/`AnalyserNode` as input is not documented — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js)
- **No build step.** UMD at `https://unpkg.com/wavesurfer.js@8` exposing global `WaveSurfer`; plugins have their own UMD builds. `yarn build` is only for contributors — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js)
- Sizes (jsDelivr, `wavesurfer.js@8.1.1`): `dist/wavesurfer.min.js` **53.5 KB**, `dist/wavesurfer.esm.js` 53.2 KB, `dist/plugins/spectrogram.min.js` **62.7 KB**, `dist/plugins/spectrogram-windowed.min.js` 62.8 KB, `dist/plugins/minimap.min.js` 56.3 KB; npm `unpackedSize` 1,698,016 bytes; **zero dependencies** — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/wavesurfer.js@8.1.1?structure=flat); [npm registry](https://registry.npmjs.org/wavesurfer.js)
- **Most actively maintained**: npm latest **8.1.1, published 2026-11-24** (three days before this research) — [npm registry](https://registry.npmjs.org/wavesurfer.js)

**Wave.js (foobar404) — note: this is NOT the same as wavesurfer.js**
- Repo: https://github.com/foobar404/Wave.js — **MIT**, verified by reading the file: "MIT License / Copyright (c) 2023 Austin Michaud" — [raw LICENSE](https://raw.githubusercontent.com/foobar404/Wave.js/main/LICENSE); GitHub sidebar shows "MIT license"; 737 stars, 170 commits — [GitHub repo page](https://github.com/foobar404/Wave.js)
- Visual: README names three animations — `Wave`, `Square`, `Glob` — and says `wave.animations` "is an object with all possible animations on it" without listing the rest. Options: `Wave` (`lineWidth`, `lineColor`, `count`), `Square` (`count`, `diamater` [sic]), `Glob` (`fillColor` incl. gradients, `lineWidth`, `lineColor`) — [GitHub repo page](https://github.com/foobar404/Wave.js)
- **Audio input: `<audio>`-element-oriented.** Constructor is `new Wave(audioElement, canvasElement)` and "the animations will start playing when the provided audio element is played"; the About blurb mentions "an audio file or audio stream" but the README does not document passing an existing `AnalyserNode`/`AudioNode` — [GitHub repo page](https://github.com/foobar404/Wave.js)
- **No build step.** CDN tag documented as `<script src="https://cdn.jsdelivr.net/gh/foobar404/wave.js/dist/bundle.js">`; also `npm i @foobar404/wave` — [GitHub repo page](https://github.com/foobar404/Wave.js)
- Size: `dist/bundle.js` is **24.8 KB**; npm `unpackedSize` 39,195 bytes; zero dependencies; npm latest **@foobar404/wave 2.0.5, published 2023-12-18** — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/@foobar404/wave@2.0.5?structure=flat); [npm registry](https://registry.npmjs.org/@foobar404%2Fwave)

**Vudio.js — LICENCE CONFLICT, treat as unsafe**
- Upstream repo https://github.com/margox/vudio.js: **no licence visible.** The GitHub sidebar shows no licence entry and the root file listing contains no LICENSE file (only `demo_src`, `.gitignore`, `README.md`, `demo.html`, `package.json`, `tea.yaml`, `vudio.js`); 255 stars, 28 commits — [GitHub repo page](https://github.com/margox/vudio.js)
- The npm package `vudio` **declares `license: MIT`** in its metadata (v2.1.1, published 2019-12-24, `browser: umd/vudio.js`, zero deps) — [npm registry](https://registry.npmjs.org/vudio). This directly contradicts the absence of a LICENSE file upstream.
- Third-party trackers also report no licence: kandi's record for `alex2wong/vudio` says no standard licence is declared ("all rights reserved"), and ecosyste.ms records `"license": null` for the same repo — [kandi](https://kandi.openweaver.com/javascript/alex2wong/vudio); [awesome.ecosyste.ms](https://awesome.ecosyste.ms/api/v1/projects/github.com%2Falex2wong%2Fvudio). The `alex2wong/vudio` README says it is "Inspired and based on https://github.com/margox/vudio.js.git" — [npm README mirror](https://app.unpkg.com/vudio@2.1.1/files/README.md)
- Visual: README names exactly one effect, `'waveform'` ("当前只有'waveform'这一个效果") — a bar-style waveform with options for bar count (`accuracy`), colours/gradients, shadow, edge fade and alignment — [GitHub repo page](https://github.com/margox/vudio.js)
- Audio input: constructor takes an `HTMLAudioElement`/`Audio` object or a `MediaStream` from `getUserMedia`. **An existing `AudioContext`/`AnalyserNode` is not documented** — [GitHub repo page](https://github.com/margox/vudio.js)
- Size: `umd/vudio.js` 38.6 KB, root `vudio.js` 36.7 KB; npm `unpackedSize` 89,641 bytes — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/vudio@2.1.1?structure=flat)

**Vanta.js — WebGL backgrounds, but NOT audio-reactive**
- Repo: https://github.com/tengbao/vanta — **MIT**. GitHub sidebar shows "MIT license"; `LICENSE.md` is the MIT permission text, "Copyright 2020 Teng Bao" (the file omits the "MIT License" title line but the body is verbatim MIT) — [raw LICENSE.md](https://raw.githubusercontent.com/tengbao/vanta/master/LICENSE.md); [GitHub repo page](https://github.com/tengbao/vanta). npm also declares `license: MIT` — [npm registry](https://registry.npmjs.org/vanta)
- Effects: Waves, Birds, Fog, Clouds, Clouds2, Trunk, Topology. Waves has adjustable wave height, shininess and speed. Credits: Birds from a three.js example, Fog from The Book of Shaders, Clouds/Clouds2 from Shadertoy shaders, Trunk/Topology from generated.space — [GitHub repo page](https://github.com/tengbao/vanta)
- **No audio reactivity is documented.** Inputs are mouse/touch/gyroscope only — [GitHub repo page](https://github.com/tengbao/vanta). Note the Shadertoy provenance of Clouds/Clouds2 is a licence question in itself (see Q3).
- Requires **three.js or p5.js loaded first** (script tag or passed in). README example loads three.js r134 from cdnjs plus `cdn.jsdelivr.net/npm/vanta/dist/vanta.waves.min.js`. Total added size stated as "about 120 KB minified and gzipped, mostly three.js" — [GitHub repo page](https://github.com/tengbao/vanta)
- **No build step for consumers**, but note npm `main` is `src/_base.js` (source, not a bundle) — you must reference `dist/vanta.*.min.js` explicitly. `dist/vanta.waves.min.js` is **11,819 bytes (11.5 KB)** and is a UMD bundle exposing `_vantaEffect` — verified by `curl` of https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.waves.min.js. 7.4k stars; npm latest **0.5.24, published 2022-09-16** — [GitHub repo page](https://github.com/tengbao/vanta); [npm registry](https://registry.npmjs.org/vanta)

**three.js official audio-reactive examples**
- three.js itself is **MIT**, verified by reading the file: "The MIT License / Copyright © 2010-2026 three.js authors" — [raw LICENSE](https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE)
- `examples/webaudio_visualizer.html` is a **~150-line single HTML file**. It renders a fullscreen quad (a 1×1 `PlaneGeometry` whose vertices go straight to clip space) showing 64 yellow spectrum columns (`fftSize / 2`, with `fftSize = 128`) on a dark grey background — [raw example source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webaudio_visualizer.html)
- Audio: a Play button triggers `init()`; the track is `./sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3`. On iOS it uses `THREE.AudioLoader` → `audio.setBuffer()` → `audio.play()`; elsewhere a plain `Audio` element plus `audio.setMediaElementSource(mediaElement)`. `THREE.AudioListener`/`THREE.Audio` create and manage the AudioContext internally; `AudioContext` is never referenced directly — [raw example source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webaudio_visualizer.html)
- **The pattern worth copying**: `tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize / 2, 1, THREE.RedFormat ) }`, refreshed each frame with `analyser.getFrequencyData()` then `uniforms.tAudioData.value.needsUpdate = true`; the fragment shader reads `texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r` and uses `step()` against `vUv.y` to fill bars. This is a one-row R8 audio texture — effectively a mini-Shadertoy audio channel — [raw example source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webaudio_visualizer.html)
- `THREE.AudioAnalyser` wraps the Web Audio `AnalyserNode` and the docs point at `webaudio_visualizer` as its usage example — [three.js AudioAnalyser docs](https://threejs.org/docs/pages/AudioAnalyser.html)

**Other notable, licence-verified projects**
- **Vissonance** (three.js/WebGL spectrum scenes, demo "currently only works in non-mobile Chrome") — **MIT**, "Copyright (c) 2020 Tariq Soliman" — [raw LICENSE](https://raw.githubusercontent.com/tariqksoliman/Vissonance/master/LICENSE); [README](https://raw.githubusercontent.com/tariqksoliman/Vissonance/master/README.md)
- **clubber.js** — **MIT**, "Copyright (c) 2016 Yannis Gravezas" — [raw LICENSE](https://raw.githubusercontent.com/wizgrav/clubber/master/LICENSE); npm `clubber@1.7.1`, published 2017-12-28, `license: MIT` — [npm registry](https://registry.npmjs.org/clubber). Not a renderer: it "listens to audio sources and extracts the underlying rhythmic information… linear frequency energies are converted into midi notes", producing "measurements… in a form suitable for direct use in webgl shaders". Ships prebuilt `clubber.min.js` / `clubber.js` (with source maps) for direct embedding — [README](https://raw.githubusercontent.com/wizgrav/clubber/master/README.md)
- **circular-audio-wave** (circular/radial waveform) — **MIT**, "Copyright (c) 2018 Kelvin Au" — [raw LICENSE](https://raw.githubusercontent.com/kelvinau/circular-audio-wave/master/LICENSE); npm 1.0.1, published 2020-09-14 — [npm registry](https://registry.npmjs.org/circular-audio-wave)
- **p5.js-sound** — **MIT**, "The MIT License (MIT) / Copyright (c) 2014-2015 The Processing Foundation" — [raw LICENSE](https://raw.githubusercontent.com/processing/p5.js-sound/main/LICENSE). Sizes (p5 1.11.3 on jsDelivr): `p5.min.js` **1,031.9 KB**, `lib/addons/p5.sound.min.js` **195.4 KB** — i.e. ~1.2 MB of script for the p5 route — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/p5@1.11.3?structure=flat)
- **ThreeAudio.js** — **MIT**, "Copyright (c) 2012 Steven Wittens" — [raw LICENSE.txt](https://raw.githubusercontent.com/unconed/ThreeAudio.js/master/LICENSE.txt)
- **web-audio-analyser** (hughsk; thin AnalyserNode helper) — **MIT** — [raw LICENSE.md](https://raw.githubusercontent.com/hughsk/web-audio-analyser/master/LICENSE.md)
- **Teoxoy/audio-visualizer** (Pixi.js) — **MIT**, 2019 — [raw LICENSE](https://raw.githubusercontent.com/Teoxoy/audio-visualizer/master/LICENSE)
- **soundcloud-visualizer** (michaelbromley) — **MIT**, 2013 — [raw LICENSE.txt](https://raw.githubusercontent.com/michaelbromley/soundcloud-visualizer/master/LICENSE.txt)
- **bitnimble/audio-visualizer** — **MIT**, 2016 — [raw LICENSE](https://raw.githubusercontent.com/bitnimble/audio-visualizer/master/LICENSE)

**FLAGGED: GPL / AGPL / licence-absent**
- **audioMotion-analyzer: AGPL-3.0-or-later** (see above). AGPL's network clause means shipping a site that uses it arguably obliges you to offer the site's corresponding source. This is the single most consequential licence finding in this catalogue — [raw LICENSE](https://raw.githubusercontent.com/hvianna/audioMotion-analyzer/master/LICENSE)
- **osci-render: GPL-3.0** — `LICENSE` is "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007" — [raw LICENSE](https://raw.githubusercontent.com/jameshball/osci-render/main/LICENSE)
- **webvs** (azeem; WebGL reimplementation of Winamp AVS): **no LICENSE file found** on either `main` or `master` — treat as all-rights-reserved — verified by probing `LICENSE`, `LICENSE.md`, `LICENSE.txt`, `license` on both branches of https://github.com/azeem/webvs
- **html5-showcqtbar** (mfcc64): **no LICENSE file found** on `main`/`master` — same probe
- **preziotte/partymode**: **no LICENSE file found** on `main`/`master` — same probe
- **mdn/voice-change-o-matic** (the repo MDN links as its working visualiser demo): **no LICENSE file found** on `main`/`master` — same probe. But MDN's own policy covers the snippets (see Q5).
- **Vudio.js**: licence conflict (npm MIT vs. no upstream LICENSE file) — see above.

### Inferences
- For a static Netlify site, the pairing with the best ratio of visual impact to integration effort is **butterchurn + butterchurnPresetsMinimal.min.js** (188 KB + 187 KB = ~375 KB of script, two `<script>` tags, MIT, and `connectAudio()` takes a node you already own).
- butterchurn's npm package has not been republished since 2019 and its presets since 2018; that is a maintenance risk for WebGL-2 driver regressions, but it is not a functional blocker since the bundles are frozen and self-contained.
- audioMotion-analyzer is the only project here that would force a licensing decision about the *site itself* rather than just attribution. If the site is closed-source, it should be excluded; if the site's source is public anyway (a plain static repo), AGPL compliance is comparatively cheap — though this is a legal judgement, not a verified fact.

### Gaps
- **Last-commit dates for all GitHub repos are unverified**: `api.github.com` was blocked in this environment, and the rendered repo pages did not expose commit dates in the fetched text. npm publish dates are used as a proxy and are labelled as such.
- butterchurn's README does not state a bundle size or give CDN/script-tag instructions; the UMD-global claim above comes from inspecting the published bundle bytes, not from documentation.
- Whether butterchurn's `connectAudio()` accepts an `AnalyserNode` specifically (vs. requiring a source/gain node) is **not documented**; the README only says "audioNode". This needs an empirical test before committing. butterchurn does its own FFT internally, so the correct input is most likely a source or gain node, not an AnalyserNode — but that is an inference, not verified.
- I found no reliable source listing the full set of `wave.animations` names in foobar404/Wave.js.

---

## Q2. Which of these can be dropped onto a static site as one or two `<script>` tags with no build step?

### Takeaway
butterchurn (+presets), wavesurfer.js, Wave.js, audioMotion-analyzer, Vanta.js (+three.js) and
clubber.js all ship usable prebuilt browser bundles on a CDN. The ones that would **force a build
step or npm install** for practical use are butterchurn's documented install path (README only
documents `pnpm add`), Vanta's `main` field (points at source, not dist), and anything from the
three.js examples folder (you copy the example, which is fine, but it pulls the three.js module
graph).

### Cited Findings
- **butterchurn: drop-in, two tags.** `https://cdn.jsdelivr.net/npm/butterchurn@2.6.7/lib/butterchurn.min.js` (188.0 KB) → `window.butterchurn`; `https://cdn.jsdelivr.net/npm/butterchurn-presets@2.4.7/lib/butterchurnPresetsMinimal.min.js` (187.0 KB) → `window.butterchurnPresets`. UMD browser-global branches verified in the bundle bytes (`t.butterchurn=e()`, `a.butterchurnPresets=e()`). **However the README documents only `pnpm add butterchurn butterchurn-presets` and never mentions CDN or script-tag usage** — [GitHub repo page](https://github.com/jberg/butterchurn); bundle headers fetched from jsDelivr
- **audioMotion-analyzer: drop-in.** Documented ESM CDN (`cdn.jsdelivr.net/npm/audiomotion-analyzer@4/+esm`) and global script (`cdn.jsdelivr.net/npm/audiomotion-analyzer@4`); `dist/index.js` sets `global.AudioMotionAnalyzer`; the README's examples load the native ES module directly in the browser with no build. You can also just download and copy `src/audioMotion-analyzer.js` — [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer); bundle header fetched from jsDelivr. **AGPL** though.
- **wavesurfer.js: drop-in.** `https://unpkg.com/wavesurfer.js@8` UMD → global `WaveSurfer`; plugins have their own UMD builds (e.g. `regions.min.js`, `spectrogram.min.js`). `npm`'s `unpkg` field resolves to `./dist/wavesurfer.min.js`. Build commands are contributor-only — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js); [npm registry](https://registry.npmjs.org/wavesurfer.js)
- **Wave.js: drop-in, one tag.** `<script src="https://cdn.jsdelivr.net/gh/foobar404/wave.js/dist/bundle.js">`, 24.8 KB — [GitHub repo page](https://github.com/foobar404/Wave.js)
- **Vanta.js: drop-in but two tags minimum.** three.js r134 from cdnjs + `cdn.jsdelivr.net/npm/vanta/dist/vanta.waves.min.js` (11.5 KB). The npm `main` field is `src/_base.js`, so a naive `import 'vanta'` would pull unbuilt source — you must target `dist/` — [GitHub repo page](https://github.com/tengbao/vanta); [npm registry](https://registry.npmjs.org/vanta)
- **clubber.js: drop-in.** README offers prebuilt `clubber.min.js` and `clubber.js` for direct embedding — [README](https://raw.githubusercontent.com/wizgrav/clubber/master/README.md)
- **Vudio.js: nominally drop-in** (`<script src="path/to/vudio.js">`, npm `browser: umd/vudio.js`, 38.6 KB) — but blocked on the licence conflict — [GitHub repo page](https://github.com/margox/vudio.js); [npm registry](https://registry.npmjs.org/vudio)
- **p5.js route: drop-in but heavy** — `p5.min.js` 1,031.9 KB + `p5.sound.min.js` 195.4 KB — [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/p5@1.11.3?structure=flat)
- **three.js examples: copy-paste, not a bundle.** `webaudio_visualizer.html` is a single ~150-line file but imports three.js as a module and relies on the examples' `jsm` paths — [raw example source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webaudio_visualizer.html)

### Inferences
- Of the drop-in set, only **butterchurn** and **audioMotion-analyzer** are documented to take a node the page already owns, which is the decisive constraint for a Strudel.cc-synthesised source (see Q7). wavesurfer.js, Wave.js and Vudio.js all expect to own the audio.
- butterchurn's lack of documented CDN usage is a documentation gap, not a technical one: the published UMD bundle works from a bare `<script>` tag. Expect to write the ~15 lines of glue yourself rather than copying a README snippet.

### Gaps
- I could not verify a published size for `clubber.min.js` (jsDelivr's file API returned nothing for the `clubber` npm versions I queried, and the README links the file on `wizgrav.github.io` rather than a CDN with a size API).

---

## Q3. Shadertoy: licence situation on user-submitted shaders, and how the iChannel audio texture works

### Takeaway
Shadertoy's **default licence for a shader with no licence stated is CC BY-NC-SA 3.0 Unported** —
non-commercial and share-alike, i.e. incompatible with MIT and a real problem for any commercial
site. Authors can choose a different licence per shader. The audio channel is a **512×2 single-channel
8-bit texture** — row 0 is the FFT spectrum, row 1 the waveform — and it is **exactly reproducible on
a plain page with an AnalyserNode**, because Shadertoy's numbers are the Web Audio spec defaults.

### Cited Findings

**Licence**
- Shadertoy's own terms page, section titled "What license will my Shaders have?", states that a shader without a licence falls under a **Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License**, and that **"you decide which license applies to every shader you create"** — [shadertoy.com/terms](https://www.shadertoy.com/terms) *(see Gaps: retrieved via search-engine extraction of that page, not a direct fetch)*
- Corroboration that most authors never change it: "most of shaders don't change it", so CC BY-NC-SA 3.0 is the licence most Shadertoy shaders end up under — [Ogre Forums thread](https://forums.ogre3d.org/viewtopic.php?t=96906)
- Corroboration on incompatibility: a shader-skills credits file states "Shadertoy shaders default to CC BY-NC-SA 3.0, which is incompatible with MIT" — [shader-skills CREDITS.md](https://github.com/gokayfem/shader-skills/blob/main/CREDITS.md)
- Separate from the licence, submitting to Shadertoy reportedly also grants Shadertoy its own broad rights: "on top of any licensing you are automatically agreeing to give your work to Shadertoy to use anyway they want" — [pouët.net thread](https://www.pouet.net/topic.php?which=10406) *(forum claim, not a quote from the terms)*
- Per-shader licences do change over time: the authors of some popular Shadertoy shaders changed their licence in 2021, so a licence assumed from an older port may be stale — [huwb/volsample issue #1](https://github.com/huwb/volsample/issues/1)
- Non-commercial default also asserted independently on two visualiser-software forums — [Magic Music Visuals forum](https://magicmusicvisuals.com/forums/viewtopic.php?p=3529); [Magic Music Visuals forum](https://magicmusicvisuals.com/forums/viewtopic.php?p=3522)
- Enforcement is live: a VidVox discourse thread documents a user re-uploading others' Shadertoy shaders under MIT, with the complaint resting on the CC BY-NC-SA default — [VidVox discourse](https://discourse.vidvox.net/t/user-bennoh-is-stealing-shaders-and-uploading-them-online-with-mit-license/2682)

**The audio texture (iChannel) — fully specified**
- "Shadertoy exposes audio through a **512x2 texture**, where the **first row is the spectrum, and second row is wave data**. Pixel format is `GL_RED` `GL_UNSIGNED_BYTE`, meaning that each pixel contains only one 8-bit channel." — [soulthreads gist](https://gist.github.com/soulthreads/2efe50da4be1fb5f7ab60ff14ca434b8)
- Stereo is downmixed to mono as `v = 0.5 * (left_v + right_v)`; **waveform** bytes are `a = clamp(128 * (1 + v), 0, 255)` — [soulthreads gist](https://gist.github.com/soulthreads/2efe50da4be1fb5f7ab60ff14ca434b8)
- **Spectrum** follows the Web Audio API spec exactly: 2048 samples → Blackman window → FFT with `fftSize = 2048` → 1024 bins → magnitudes divided by `fftSize` → temporal smoothing `v = k*v_prev + (1-k)*v` with **k = 0.8** → `dB = 20*log10(v)` → clamp to **dB_min = -100, dB_max = -30** → scale to 0..255 — [soulthreads gist](https://gist.github.com/soulthreads/2efe50da4be1fb5f7ab60ff14ca434b8), citing the [Web Audio API FFT spec](https://webaudio.github.io/web-audio-api/#fft-windowing-and-smoothing-over-time)
- Important consequence: 2048-sample FFT gives 1024 bins but the texture is only 512 px wide, so **only the lower half of the spectrum (0–11,025 Hz at 44.1 kHz) is available** — [soulthreads gist](https://gist.github.com/soulthreads/2efe50da4be1fb5f7ab60ff14ca434b8)
- Sample-rate caveat: iq's reference shader assumes 48 kHz but in practice browsers often deliver 44.1 kHz; a mismatch "squishes" the spectrum by 1.09× and scales values ~1.09× smaller — [soulthreads gist](https://gist.github.com/soulthreads/2efe50da4be1fb5f7ab60ff14ca434b8)
- Sampling convention in a Shadertoy-compatible host: spectrum read at **y ≈ 0.25**, waveform at **y ≈ 0.75**, x in 0..1 — [Synthclipse user guide](https://synthclipse.sourceforge.net/user_guide/music.html)
- Shadertoy does not expose FFT as a float uniform: "It provides FFT data as a texture." — [WebGL Fundamentals QnA](https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-get-audio-data-into-a-shader.html) (that page's prose is CC BY-SA 4.0, attributed to David Clews)
- The same one-row-audio-texture pattern is in three.js core examples as `new THREE.DataTexture( analyser.data, fftSize/2, 1, THREE.RedFormat )` sampled as `texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r` — [three.js webaudio_visualizer source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webaudio_visualizer.html)

### Inferences
- **Yes, the iChannel audio pattern is reimplementable on a plain page with an AnalyserNode, and essentially byte-for-byte.** Shadertoy's documented constants (`fftSize` 2048, smoothing 0.8, minDecibels -100, maxDecibels -30, Blackman window) are the Web Audio API's own defaults for `AnalyserNode`, so `getByteFrequencyData()` on a default AnalyserNode already produces Shadertoy's row 0 (take the first 512 of the 1024 bins), and `getByteTimeDomainData()` produces row 1 (512 samples). Upload as a `gl.R8`/`gl.LUMINANCE` 512×2 texture each frame and an unmodified Shadertoy audio shader should run.
- The licence picture means **Shadertoy is a reference library, not a code supply.** Any shader you take must be checked individually, and the default (CC BY-NC-SA 3.0) rules out commercial use and forces share-alike. Note this also taints downstream code: Vanta.js credits its Clouds/Clouds2 effects to Shadertoy shaders while shipping under MIT, which is at minimum worth checking before relying on Vanta's MIT grant for those two effects.
- Writing your own GLSL against the 512×2 convention is the clean path: you get Shadertoy's ergonomics with none of its licence exposure.

### Gaps
- **I could not fetch shadertoy.com directly.** `/terms`, `/faq` and `/howto` all returned HTTP 403, and `curl` received Cloudflare's "Just a moment… Enable JavaScript and cookies to continue" interstitial. `web.archive.org` was blocked by this environment's egress policy. The licence wording above therefore comes from a search engine's extraction of the live terms page plus multiple independent corroborating sources; **it should be re-read directly at https://www.shadertoy.com/terms before relying on it legally.**
- I found no official Shadertoy documentation of the 512×2 audio texture layout. All layout details above come from a community gist and a third-party tool's (Synthclipse) docs. The gist's own author flags the sample-rate question as an unconfirmed observation.
- The exact UI of Shadertoy's per-shader licence picker (its options and labels) is unverified.
- Shadertoy also has a "Sound" shader output type (`mainSound()`) for *generating* audio; I could not retrieve documentation for it.

---

## Q4. Notable single-file canvas 2D visualizers with permissive licences worth copying wholesale

### Takeaway
The canonical canvas 2D recipes (oscilloscope, frequency bars) live in **MDN's Web Audio
visualisation guide and are CC0 public domain** — the most permissive possible, and the right thing
to copy wholesale. Beyond MDN, the genuinely single-file permissive options are
**circular-audio-wave** (MIT, radial), **Wave.js** (MIT, 24.8 KB), and **clubber.js** (MIT) as the
analysis half. Several well-known canvas demos (partymode, showcqtbar, voice-change-o-matic) have
**no LICENSE file**.

### Cited Findings
- **MDN code samples are CC0.** MDN's attribution and licensing page states: "Code samples added on or after August 20, 2010 are in the public domain **CC0**. No licensing notice is necessary" (samples added before that date are MIT). Contributors agree that "your code samples are available under Creative Commons CC-0 (a Public Domain dedication)" — [MDN Writing guidelines: Attribution and copyright licensing](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license)
- MDN's **oscilloscope** recipe: `analyser.fftSize = 2048`; `bufferLength = analyser.frequencyBinCount` (= 1024, half of fftSize); `new Uint8Array(bufferLength)`; `analyser.getByteTimeDomainData(dataArray)`; per-sample `const v = dataArray[i] / 128.0; const y = v * (HEIGHT / 2);`; `draw()` loop driven by `requestAnimationFrame(draw)`. The `draw()` function is **about 30–35 lines** including comments — [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- MDN's **frequency bar graph** ("Winamp-style") recipe: `fftSize = 256` (→ 128 bins) so bars read as bars; bar width `(WIDTH / bufferLength) * 2.5`; bar height `dataArray[i] / 2`; drawn upward from the bottom at `HEIGHT - barHeight / 2`; fill `rgb(${barHeight + 100} 50 50)` so taller bars are brighter. `draw()` is **about 25 lines**, core loop ~10 lines — [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- MDN also documents that the AnalyserNode "doesn't need an output connection as long as its input is connected to the source", and lists `getFloatFrequencyData()` / `getFloatTimeDomainData()` for `Float32Array` variants — [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- **Caveat: MDN's snippets are NOT self-contained.** They rely on undefined externals (`analyser`, `canvasCtx`, `WIDTH`, `HEIGHT`, `dataArray`, `bufferLength`), the bar-graph excerpts use `// ...` placeholders, and the bar-graph `draw()` assigns `drawVisual` without declaring it. MDN points to the Voice-change-O-matic demo for working code — [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- `mdn/voice-change-o-matic`, the repo MDN links for working code, has **no LICENSE file** on `main` or `master` — verified by probing `LICENSE`, `LICENSE.md`, `LICENSE.txt`, `license` on both branches
- **circular-audio-wave** — radial/circular waveform, **MIT** ("Copyright (c) 2018 Kelvin Au"), npm 1.0.1 (2020-09-14), zero npm dependencies — [raw LICENSE](https://raw.githubusercontent.com/kelvinau/circular-audio-wave/master/LICENSE); [npm registry](https://registry.npmjs.org/circular-audio-wave)
- **Wave.js** — `dist/bundle.js` is a single **24.8 KB** file, MIT, with named `Wave`/`Square`/`Glob` canvas animations — [raw LICENSE](https://raw.githubusercontent.com/foobar404/Wave.js/main/LICENSE); [jsDelivr file API](https://data.jsdelivr.com/v1/packages/npm/@foobar404/wave@2.0.5?structure=flat)
- **soundcloud-visualizer** (michaelbromley) — "an experiment in using the web audio API together with canvas", **MIT** 2013 — [raw LICENSE.txt](https://raw.githubusercontent.com/michaelbromley/soundcloud-visualizer/master/LICENSE.txt)
- **Teoxoy/audio-visualizer** (Pixi.js, particle-ish) — **MIT** 2019 — [raw LICENSE](https://raw.githubusercontent.com/Teoxoy/audio-visualizer/master/LICENSE)
- **bitnimble/audio-visualizer** — **MIT** 2016 — [raw LICENSE](https://raw.githubusercontent.com/bitnimble/audio-visualizer/master/LICENSE)
- **Unlicensed canvas demos to avoid copying**: `preziotte/partymode`, `mfcc64/html5-showcqtbar`, `azeem/webvs`, `CodeDotJS/audio-visualizer` — **no LICENSE file** found on `main` or `master` for any of them (probed `LICENSE`, `LICENSE.md`, `LICENSE.txt`, `license`)
- **The best index of experiments/CodePens**: `willianjusten/awesome-audio-visualization` is itself CC0. It catalogues ~70 "Experiments" (PartyMode, Vissonance, ShowCQTBar, audioMotion, Patatap, Plink, Typatone, Chrome Music Lab, mattdesl's codevember Silk/Wave/Binaural, brunoimbrizi Experiment #8, ClubberToy, osci-render, …) and a dedicated **"On Codepen"** section of 17 pens — [awesome-audio-visualization](https://github.com/willianjusten/awesome-audio-visualization)
- Named CodePen entries from that list include: Audio Visualizer (Francesco Trillini) `codepen.io/Francext/full/yIogq/`, CSS Audio Visualizer `codepen.io/njmcode/full/WbWyWz/`, Cubes Audio Visualizer `codepen.io/pat_hg/pen/zvMrRJ`, Oscilator `codepen.io/easwee/pen/sFpmo`, WebGL Soundcloud Visualizer using Three.js `codepen.io/luigimannoni/full/xbLgqB`, Clubberize yin-yang example `codepen.io/wizgrav/pen/PWKNmg`, Gooey Effect Audio `codepen.io/enjikaka/full/QbJmRJ` — [awesome-audio-visualization](https://github.com/willianjusten/awesome-audio-visualization)
- Other awesome-lists covering this space: `johnweisz/awesome-webaudio` (lists wavesurfer.js as "interactive navigable audio visualization using Web Audio and Canvas") and the older `notthetup/awesome-webaudio` (some entries marked obsolete) — [johnweisz/awesome-webaudio](https://github.com/johnweisz/awesome-webaudio); [notthetup/awesome-webaudio listing](https://awesome.ecosyste.ms/lists/notthetup%2Fawesome-webaudio)
- Tutorial write-ups where authors explain visualiser architecture, from the same list: Codrops "Creative Audio Visualizers" (tympanus.net/codrops/2018/03/06/creative-audio-visualizers/), "Audio Visualization with Web Audio and Three.js" (raathigesh.com), 24ways "Make Your Browser Dance" (24ways.org/2013/make-your-browser-dance/), "Exploring the web audio api with d3" (blog.scottlogic.com/2016/01/06/audio-api-with-d3.html) — [awesome-audio-visualization](https://github.com/willianjusten/awesome-audio-visualization)

### Inferences
- **The highest-value "copy wholesale" target in the whole catalogue is MDN's two `draw()` functions**, precisely because they are CC0 with no notice required and about 25–35 lines each. They are not runnable as-is, so budget ~20 lines of setup (canvas sizing, `getContext('2d')`, analyser wiring) around them — but that setup is trivial and you then own the code outright with zero licence obligations.
- CodePen pens are a research/inspiration source, not a code supply: CodePen pens have no repo-level LICENSE file, so each pen's reuse terms depend on CodePen's own ToS and the author's wishes, neither of which I verified.

### Gaps
- **I did not verify the licence terms of any individual CodePen pen**, nor CodePen's default reuse policy. Treat every pen as unlicensed until checked with the author.
- I found no notable Observable notebooks devoted to audio visualisation in these searches. The `awesome-audio-visualization` list contains no Observable entries, and no Observable notebook surfaced in any search. **I found no reliable source on Observable audio-visualisation collections** — this may simply be because Observable's audience skews toward static data viz rather than real-time audio.
- Exact line/KB counts for most of the individual experiment repos (Vissonance, circular-audio-wave, soundcloud-visualizer) are unverified; only the npm-published ones have measured sizes above.

---

## Q5. SVG-based audio-reactive work, and whether SVG is performant enough for real-time FFT at 60fps

### Takeaway
SVG audio-reactive work exists but is thin, and it is mostly **trigger/MIDI-driven animation rather
than per-frame FFT rendering**. The performance evidence is genuinely conflicting: one direct
benchmark shows imperative SVG collapsing to 18.8 fps at 200 elements while canvas holds 60, but a
2018 academic comparison found SVG and canvas near-equal. The deciding variable in every source is
**how many DOM nodes you update per frame**, not SVG per se.

### Cited Findings
- **Direct benchmark (against SVG):** a comparison of React-driven SVG, imperative SVG and canvas for real-time telemetry found that "imperative SVG, the genuinely good version with no React in the hot path, collapses to **18.8 fps at N=200**", while "canvas holds a flat 60" — [DEV: SVG renders telemetry at 60fps, we use canvas anyway](https://dev.to/jaya_chapparam/svg-renders-telemetry-at-60fps-we-use-canvas-anyway-and-here-is-the-measured-reason-15gc). **Caveat: one developer, one machine, telemetry not audio.**
- **Academic counterpoint (for SVG):** a 2018 TU Dresden poster comparing rendering technologies for large graphs found **SVG and Canvas perform almost equally**, contradicting the common assumption that canvas is faster — [Horak 2018, Graph Performance Poster](https://mt.inf.tu-dresden.de/cnt/uploads/Horak-2018-Graph-Performance-Poster.pdf). Measured interaction FPS on graphs, not audio.
- **Mechanism both sides agree on:** manipulating many DOM elements (hundreds of bars or path segments) causes layout thrashing and poor performance; a small number of SVG shapes updated via a single `path` attribute can stay fast — [per vendor/tooling docs surfaced in the comparison](https://apexcharts.com/blog/svg-vs-canvas-charts); [yWorks: SVG, Canvas, WebGL](https://www.yworks.com/blog/svg-canvas-webgl)
- Large-scale production migrations have gone SVG → canvas for exactly this reason — [Felt: From SVG to Canvas, part 1 — making Felt faster](https://felt.com/blog/from-svg-to-canvas-part-1-making-felt-faster)
- A third comparison frames the same tradeoff for diagram viewers (SVG vs canvas vs WebGL: bottlenecks and how to measure) — [DEV: SVG vs Canvas vs WebGL for diagram viewers](https://dev.to/vitalf/svg-vs-canvas-vs-webgl-for-diagram-viewers-tradeoffs-bottlenecks-and-how-to-measure-34n7)
- **Named SVG audio-reactive work:** a Halogen (PureScript) SVG audio visualizer demo — [PureScript Discourse: Show: Halogen SVG Audio Visualizer Demo](https://discourse.purescript.org/t/show-halogen-svg-audio-visualizer-demo/1556)
- **SVG entries in the awesome list's CodePen section** are MIDI/trigger-driven, not FFT: "SVG Animated Drum Kit" `codepen.io/iamjoshellis/full/KVdQqm/` and "SVG Animated Guitar" `codepen.io/iamjoshellis/full/qbBKZB/`. The list also includes a "CSS Visualizer" (`likethemammal.github.io/css-visualizer/`) and "Syncing CSS Animations with HTML5 Audio" — i.e. the DOM-based cluster in this space is mostly CSS/SVG keyframe sync rather than per-frame spectrum rendering — [awesome-audio-visualization](https://github.com/willianjusten/awesome-audio-visualization)
- The analysis cost is identical either way: the FFT comes from an `AnalyserNode`, which performs the real-time FFT and hands you an array; the rendering choice doesn't change the analysis cost — [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)

### Inferences
- **Practical answer: SVG is fine for a low-element-count audio-reactive design and unwise for a classic many-bar spectrum.** A 32–64-element SVG spectrum, or a single `<path>` whose `d` attribute you rewrite once per frame from the time-domain array, should hold 60 fps; 240 individually-updated `<rect>` bars (audioMotion's 1/24-octave mode, for instance) is exactly the case both the DEV benchmark and the vendor docs call out as pathological.
- The sources are not actually in conflict once you read the mechanism: the academic poster measured scenes where per-frame DOM mutation count was low or amortised, the DEV benchmark measured high per-frame mutation counts. Element count per frame, not technology, is the variable.
- Because SVG audio-reactive work is thin and mostly keyframe-based, there is **no SVG equivalent of butterchurn or audioMotion-analyzer to borrow**. SVG audio reactivity on a static site means writing it yourself against an AnalyserNode — which is cheap, and which the CC0 MDN recipes translate to directly (swap `canvasCtx.lineTo` for points in a `path` `d` string).

### Gaps
- **I found no audio-specific SVG-vs-canvas benchmark.** Both performance sources measure other workloads (telemetry, graph layout). Any 60 fps claim for a specific SVG FFT visualiser should be measured on the target devices.
- No well-known, licence-verified, maintained SVG FFT visualiser library surfaced. The Halogen demo is a PureScript demo on a forum thread; I did not verify its licence or retrieve its source.
- I did not verify the licence of the two `iamjoshellis` SVG CodePens, nor confirm that they are MIDI/trigger-driven rather than FFT-driven — that reading comes from their titles and category in the awesome list.

---

## Q6. Audio-sourcing model per project (critical for the Strudel.cc constraint)

### Takeaway
Only **butterchurn** and **audioMotion-analyzer** are documented to accept an audio node the page
already owns, which is the requirement for Strudel.cc-synthesised audio. wavesurfer.js, Wave.js and
Vudio.js all insist on owning the audio (URL, `<audio>` element, or `MediaStream`). The three.js and
MDN patterns are code you write yourself, so they take whatever node you give them.

### Cited Findings
- **butterchurn: `visualizer.connectAudio(audioNode)`** — "get audioNode from audio source or microphone" — [GitHub repo page](https://github.com/jberg/butterchurn)
- **audioMotion-analyzer: `source` option / `connectInput()` accept "an HTMLMediaElement or an AudioNode (or any of its descendants)"**, plus `connectOutput()` to route onward and an `audioCtx` option to supply your own AudioContext — [GitHub repo page](https://github.com/hvianna/audioMotion-analyzer)
- **wavesurfer.js: owns its audio.** `url: '/audio.mp3'` (fetched + decoded, CORS applies), or pre-decoded `peaks` + `duration` ("Streaming audio is supported only with pre-decoded peaks and duration"). It can be connected *into* a Web Audio graph "by exporting its audio element", but accepting an existing AudioNode is not documented, and the README says it isn't meant to be a general Web Audio wrapper — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js)
- **Wave.js: owns its audio.** `new Wave(audioElement, canvasElement)`; "the animations will start playing when the provided audio element is played" — [GitHub repo page](https://github.com/foobar404/Wave.js)
- **Vudio.js: owns its audio.** Constructor takes an `HTMLAudioElement`/`Audio` or a `MediaStream` from `getUserMedia`; cross-origin audio is blocked by same-origin policy; `AudioContext`/analyser input not documented — [GitHub repo page](https://github.com/margox/vudio.js)
- **three.js webaudio_visualizer: owns its audio in the example**, via `THREE.AudioLoader` (iOS) or `audio.setMediaElementSource(mediaElement)`; but `THREE.AudioAnalyser` wraps a standard `AnalyserNode`, so the DataTexture pattern is reusable with any analyser — [raw example source](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/webaudio_visualizer.html); [three.js AudioAnalyser docs](https://threejs.org/docs/pages/AudioAnalyser.html)
- **MDN recipes: you own everything.** They assume an `analyser` variable you created, and note the AnalyserNode "doesn't need an output connection as long as its input is connected to the source" — [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- **clubber.js: node-oriented by design** — it "listens to audio sources and extracts the underlying rhythmic information", producing values "in a form suitable for direct use in webgl shaders, or any other context" — [README](https://raw.githubusercontent.com/wizgrav/clubber/master/README.md)
- **Vanta.js: no audio input at all** — mouse/touch/gyroscope only — [GitHub repo page](https://github.com/tengbao/vanta)
- The cross-origin problem the brief describes is corroborated by wavesurfer's own docs: fetched audio is subject to CORS headers, and Vudio's README notes cross-origin audio is blocked by same-origin policy — [GitHub repo page](https://github.com/katspaugh/wavesurfer.js); [GitHub repo page](https://github.com/margox/vudio.js)

### Inferences
- For a Strudel.cc-driven page, the viable shortlist narrows sharply: **butterchurn (MIT, takes a node)**, **audioMotion-analyzer (AGPL, takes a node)**, **clubber.js (MIT, takes a node, but you write the renderer)**, and **hand-rolled canvas/WebGL from the CC0 MDN and MIT three.js patterns**. Everything else would need to be forked to accept an external node — which converts a "no build step" project into a maintained fork.
- Because Strudel runs in the same page and the same AudioContext, the analyser can simply be inserted on Strudel's output chain; none of the CORS problems that affect file- or iframe-based sources apply.

### Gaps
- Whether butterchurn's `connectAudio()` works correctly when handed an `AnalyserNode` specifically (as opposed to a gain/source node) is **not documented anywhere I could find**, and butterchurn performs its own internal FFT. This needs an empirical test.
- I did not find documentation on how Strudel.cc exposes its output AudioNode / AudioContext; that was outside the assigned scope and should be confirmed separately.

---

## Q7. Summary comparison table (all figures verified above)

| Project | Licence (verified how) | Renderer | Audio input | Drop-in? | Prebuilt size | Latest publish |
|---|---|---|---|---|---|---|
| [butterchurn](https://github.com/jberg/butterchurn) | **MIT** (LICENSE file read) | WebGL 2 | `connectAudio(audioNode)` — **external node OK** | **Yes**, UMD `window.butterchurn` (undocumented) | `butterchurn.min.js` 188.0 KB | npm 2.6.7, 2019-03-12 |
| [butterchurn-presets](https://github.com/jberg/butterchurn-presets) | **MIT** (LICENSE file read) | n/a (data) | n/a | **Yes**, UMD `window.butterchurnPresets` | Minimal 187.0 KB / Base 638.3 KB / Extra 825.0 KB; pkg ~11.3 MB | npm 2.4.7, 2018-06-09 |
| [audioMotion-analyzer](https://github.com/hvianna/audioMotion-analyzer) | **AGPL-3.0-or-later** ⚠ (LICENSE file read + npm) | Canvas 2D | `source`/`connectInput()` — **external node OK** | **Yes**, ESM + UMD `AudioMotionAnalyzer` | `dist/index.js` 93.4 KB (README: ~30 KB min) | npm 4.5.4, 2026-01-09 |
| [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) | **BSD-3-Clause** (LICENSE file read + npm) | Canvas 2D | URL / peaks / `<audio>` — **owns audio** | **Yes**, UMD `WaveSurfer` | 53.5 KB + spectrogram 62.7 KB | npm 8.1.1, **2026-11-24** |
| [Wave.js (foobar404)](https://github.com/foobar404/Wave.js) | **MIT** (LICENSE file read + npm) | Canvas 2D | `<audio>` element — **owns audio** | **Yes**, one tag | `dist/bundle.js` 24.8 KB | npm 2.0.5, 2023-12-18 |
| [Vudio.js](https://github.com/margox/vudio.js) | **CONFLICT** ⚠ npm says MIT; **no LICENSE file in repo** | Canvas 2D | `<audio>` / `MediaStream` — **owns audio** | Yes (`umd/vudio.js`) | 38.6 KB | npm 2.1.1, 2019-12-24 |
| [Vanta.js](https://github.com/tengbao/vanta) | **MIT** (LICENSE.md read + npm) | WebGL (three.js/p5) | **none — not audio-reactive** | Yes, but needs three.js first | `vanta.waves.min.js` 11.5 KB (+~120 KB with three.js) | npm 0.5.24, 2022-09-16 |
| [three.js examples](https://github.com/mrdoob/three.js) | **MIT** (LICENSE file read) | WebGL | example owns audio; pattern takes any analyser | Copy-paste, ~150 lines | n/a | three.js dev branch, 2026 copyright |
| [MDN recipes](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) | **CC0** (MDN policy page read) | Canvas 2D | yours entirely | Copy-paste, ~25–35 lines each | n/a | living doc |
| [clubber.js](https://github.com/wizgrav/clubber) | **MIT** (LICENSE file read + npm) | n/a (analysis → shader uniforms) | **external node OK** | Yes, prebuilt `clubber.min.js` | unverified | npm 1.7.1, 2017-12-28 |
| [Vissonance](https://github.com/tariqksoliman/Vissonance) | **MIT** (LICENSE file read) | WebGL (three.js) | unverified | unverified | unverified | — |
| [circular-audio-wave](https://github.com/kelvinau/circular-audio-wave) | **MIT** (LICENSE file read + npm) | Canvas 2D (radial) | unverified | npm only (no CDN verified) | unverified | npm 1.0.1, 2020-09-14 |
| [webvs](https://github.com/azeem/webvs) | **NO LICENCE FILE** ⚠ | WebGL (AVS clone) | unverified | — | — | — |
| [osci-render](https://github.com/jameshball/osci-render) | **GPL-3.0** ⚠ (LICENSE file read) | oscilloscope | n/a (desktop/plugin) | no | — | — |
| [html5-showcqtbar](https://github.com/mfcc64/html5-showcqtbar) | **NO LICENCE FILE** ⚠ | Canvas (CQT bars) | unverified | — | — | — |
| [partymode](https://github.com/preziotte/partymode) | **NO LICENCE FILE** ⚠ | Canvas | unverified | — | — | — |
| [Shadertoy shaders](https://www.shadertoy.com/terms) | **CC BY-NC-SA 3.0 by default** ⚠ non-commercial + share-alike; per-shader override | WebGL/GLSL | 512×2 R8 audio texture | reimplementable from AnalyserNode | — | — |

---

## Environment / method caveats affecting these notes

- `api.github.com` was unavailable ("GitHub access to this repository is not enabled for this session"), so **no last-commit or last-push dates were verified**; npm publish dates are the activity proxy throughout and are labelled as such.
- `shadertoy.com` returns HTTP 403 to automated fetches and serves a Cloudflare JS interstitial to `curl`; `web.archive.org` was blocked by this environment's egress policy. Shadertoy licence wording is therefore second-hand and flagged in the Q3 Gaps.
- `npmjs.com` web pages returned HTTP 403; all npm facts above come from `registry.npmjs.org` JSON metadata instead, which is the authoritative source for the `license`, `dist-tags`, `time`, `main`/`unpkg`/`browser` and `unpackedSize` fields quoted.
- jsDelivr's `data.jsdelivr.com` file API returned no file list for `clubber` and `circular-audio-wave`, so their file sizes are unverified.
