# Audio-reactive visualisation in the d3.js and Processing/p5.js ecosystems (as of late 2026)

Scope note: all version numbers and dates below were checked against primary sources (registry metadata, LICENSE files, official docs) on 2026-11-27 unless stated otherwise. Where a source could not be reached, it is recorded under **Gaps** rather than guessed at.

---

## Q1. Is d3 a sensible tool for real-time audio reactivity? Where is the practical ceiling, and what is the idiomatic workaround?

### Takeaway
d3 is the wrong instrument for *rendering* a 1024-bin spectrum at 60fps, but the right instrument for *mapping* it. The idiomatic, well-documented pattern is to keep d3's scales, shape generators and timer, and throw away its DOM-element data-join in favour of a `<canvas>` — d3's own ecosystem documents this explicitly as the approach for "thousands of elements".

### Cited Findings
- d3 core is deliberately a toolbox of independent modules, not a renderer: it "works in any JavaScript environment", and the getting-started docs present scales/shapes/timers as separable from the DOM-manipulation module — [d3js.org getting-started](https://d3js.org/getting-started)
- SVG/DOM ceiling, conservative end: *D3.js in Action* (3rd ed.) states SVG performance "can drop sharply once the DOM holds more than about 1,000 elements, which makes Canvas the better choice" — [Manning, D3.js in Action 3e, ch.15 "Rendering visualizations with Canvas"](https://livebook.manning.com/book/d3js-in-action-third-edition/chapter-15)
- SVG/DOM ceiling, optimistic end: a 2016 reply on the d3-js list put a reasonable ceiling at ~10,000 SVG elements on a page, noting animation "gets choppy around there" and that the limit varies by machine — [Google Groups d3-js](https://groups.google.com/g/d3-js/c/nwf_Jafk_E8); an older 2011 reply on the same list guessed a theoretical limit in the hundreds of thousands — [Google Groups d3-js](https://groups.google.com/d/msg/d3-js/ZJ6pznVU5LQ/wLYuIGPUnvsJ)
- Benchmark contrast: one published benchmark of 10,000 rows measured D3/SVG at 682 ms versus 173 ms for D3/Canvas — [The Linux Code](https://thelinuxcode.com/unleash-the-speed-a-deep-dive-into-d3-js-and-html5-canvas/)
- Academic measurement: a 2018 TU Dresden graph-performance poster found performance losses beginning around 400 nodes (~8,000 graphical elements), with SVG and Canvas performing roughly equally at that scale — [Horak 2018 Graph Performance Poster (PDF)](https://mt.inf.tu-dresden.de/cnt/uploads/Horak-2018-Graph-Performance-Poster.pdf)
- The trade-off is stated plainly: Canvas "avoids the DOM-manipulation cost of every update, but you lose D3 data-join and transition conveniences" — [The Linux Code](https://thelinuxcode.com/unleash-the-speed-a-deep-dive-into-d3-js-and-html5-canvas/); and the standard advice is to "switch to Canvas once you need to display thousands of elements at once" — [ExpertBeacon](https://expertbeacon.com/d3-and-canvas-in-3-steps-the-bind-the-draw-and-the-interactivity/)
- The default analyser resolution that would be joined is large: `frequencyBinCount` is "An unsigned long value half that of the FFT size", i.e. 1024 bins at the default `fftSize` of 2048 — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- There is a published, concrete precedent for driving d3 from an analyser with `d3.timer` rather than SVG-heavy joins — Alex Zywiak's tutorial runs the update loop with `d3.timer` and calls `analyser.getByteFrequencyData(frequencyData)` inside it "so that we get real time audio data" — [Audio Visualiser Using D3](https://alexzywiak.github.io/audio-visualiser-using-d3/index.html)

### Inferences
- Arithmetic worth stating in the report: a naive `svg.selectAll("rect").data(freqArray).join("rect")` on 1024 bins at 60fps means 61,440 element-level attribute writes per second plus a 1024-element join diff per frame. Even at the optimistic 10,000-element ceiling, the problem is not the *count* of elements (1024 is fine to have on screen) but the *per-frame mutation rate* and layout/paint invalidation of the SVG subtree. The cited numbers are all static-render benchmarks, so they understate the cost of mutating every element every frame.
- The honest framing for the report: d3 is a *data-to-geometry* library that happens to ship a DOM binder. For audio, keep the first half (`scaleLinear`, `scaleLog`, `scaleBand`, `arc`, `lineRadial`, `curveBasis`, `timer`) and replace the second half with canvas `fill()`/`stroke()` calls or `line.context(ctx)`.
- Practical ceiling to quote: SVG re-joins are comfortable up to roughly 64–256 bars at 60fps (a typical "bar spectrum" downsampled from the full FFT); above a few hundred mutating elements per frame expect frame drops on mid-range hardware, and at 1024 bins SVG is not viable. Canvas with d3 scales handles 1024 bins at 60fps without difficulty. This is an inference from the benchmark figures above, not a measured claim from a single source.

### Gaps
- I found **no benchmark that specifically measures a d3 SVG data-join of ~1024 elements repeated at 60fps**. All the figures above are one-off renders of N elements, not per-frame re-joins. The report should present the ceiling as an engineering judgement supported by static-render benchmarks, not as a measured 60fps figure.

---

## Q2. Idiomatic patterns for driving d3 from a Web Audio AnalyserNode

### Takeaway
The pattern is fully documented across MDN (analyser → typed array) and d3's own module docs (scales, shapes, timer); nothing exotic is needed, and the whole thing works from two CDN script tags with no build step.

### Cited Findings — getting the data out
- `fftSize` is "An unsigned long value representing the size of the FFT (Fast Fourier Transform) to be used to determine the frequency domain"; `frequencyBinCount` is half of it and "generally equates to the number of data values you will have to play with for the visualization" — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- `getByteFrequencyData()` "Copies the current frequency data into a Uint8Array (unsigned byte array) passed into it"; values are scaled from `minDecibels` to `maxDecibels` into 0–255 — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- `getFloatFrequencyData()` "Copies the current frequency data into a Float32Array array passed into it" and its output is in **decibels** (not 0–1) — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- `getByteTimeDomainData()` gives the waveform as unsigned bytes with silence at 128; MDN's own oscilloscope example divides by 128.0 to centre it — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- `smoothingTimeConstant` is "A double value representing the averaging constant with the last analysis frame — basically, it makes the transition between values over time smoother" — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- Defaults per the Web Audio spec (MDN's page does not state them; flagged as such by the page itself): `fftSize` 2048, power of two between 32 and 32768; `smoothingTimeConstant` 0.8 in 0–1; `minDecibels` -100, `maxDecibels` -30 — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- MDN's example allocates the array from `frequencyBinCount` so it holds exactly what the analyser writes: `analyser.fftSize = 2048; const bufferLength = analyser.frequencyBinCount; const dataArray = new Uint8Array(bufferLength);` — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- Allocate the typed array **once**, outside the loop, and refill it each frame — this is what MDN's example does (array created before the draw loop, `getByteTimeDomainData(dataArray)` called inside it) — [MDN AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- Practical FFT-size guidance from a tutorial source: 512–1024 "is a good balance between resolution and performance" — [Effect Labs, Audio Visualizer in JavaScript](https://effect-labs.com/en/pages/blog/audio-visualizer-js.html)
- Graph topology: the published pattern is source → AnalyserNode → destination, so the audio is both analysed and audible; a `MediaElementAudioSourceNode` is "linked to an AnalyserNode (where audio data is extracted for visualisation), which is then linked to the speakers" — [Scott Logic, Exploring the Web Audio API with D3](https://blog.scottlogic.com/2016/01/06/audio-api-with-d3.html)
- A worked d3 example uses `Uint8Array` plus `analyser.getByteFrequencyData(frequencyData)` to "grab the frequency data of the audio" — [Big Nerd Ranch, Music Visualization with D3.js](https://bignerdranch.com/blog/music-visualization-with-d3-js/)

### Cited Findings — the loop: requestAnimationFrame vs d3.timer
- d3-timer is "an efficient queue capable of managing thousands of concurrent animations, while guaranteeing consistent, synchronized timing with concurrent or staged animations" — [d3js.org/d3-timer](https://d3js.org/d3-timer)
- It is a wrapper, not a competitor: "Internally, it uses requestAnimationFrame for fluid animation (if available), switching to setTimeout for delays longer than 24ms" — [d3js.org/d3-timer](https://d3js.org/d3-timer)
- `d3.now()` is frame-consistent: "The current time is updated at the start of a frame; it is thus consistent during the frame, and any timers scheduled during the same frame will be synchronized" — [d3js.org/d3-timer](https://d3js.org/d3-timer)
- Backgrounded-tab behaviour: "The apparent elapsed time may be less than the true elapsed time if the page is backgrounded and requestAnimationFrame is paused; in the background, apparent time is frozen" — [d3js.org/d3-timer](https://d3js.org/d3-timer)
- `d3.timer(callback, delay, time)` runs "repeatedly until the timer is stopped"; `timer.stop()` "Stops this timer, preventing subsequent callbacks"; `d3.interval` and `d3.timeout` are "suitable replacement[s] for setInterval / setTimeout that [are] guaranteed to not run in the background" — [d3js.org/d3-timer](https://d3js.org/d3-timer)
- A real audio-reactive d3 example chose `d3.timer` over bare rAF — [Audio Visualiser Using D3](https://alexzywiak.github.io/audio-visualiser-using-d3/index.html)

### Cited Findings — mapping bins to geometry
- d3's getting-started page shows importing individual modules from CDN, e.g. `import {forceSimulation, forceCollide, forceX} from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";` — so a sketch can pull in only `d3-scale` and `d3-shape` if desired — [d3js.org/getting-started](https://d3js.org/getting-started)
- A published d3-audio writeup maps frequencies to colours with d3's sequential scales — [Visualizing Sound With D3 and Web Audio API (Medium/The Startup)](https://medium.com/swlh/visualizing-sound-with-d3-and-web-audio-api-435ffea88f30)
- One Observable spectrogram documents the bin-to-frequency mapping explicitly: "Its frequency bins are spread linearly from 0 to ½ of the sample rate" — [🎤 Spectrogram / Visnu Pitiyanuvath](https://observablehq.com/@visnup/spectrogram)
- Independent confirmation of the bin→Hz relationship from a second ecosystem: Tone.js's FFT (which p5.sound 0.4.x wraps) computes `getFrequencyOfIndex(index) = index * sampleRate / (2 * size)` — verified in the p5.sound 0.4.2 bundle fetched from [cdn.jsdelivr.net/npm/p5.sound@0.4.2](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)

### Inferences
- **Scale choice.** `scaleBand` is the right instrument for a bar spectrum (it gives you `bandwidth()` for bar width and padding for free); `scaleLinear` for amplitude → pixel height (domain `[0,255]` for byte data, or `[-100,-30]` dB for float data, matching `minDecibels`/`maxDecibels`); `scaleLog` for the *frequency* axis, because bins are linear in Hz while pitch perception is logarithmic — the Visnu notebook's "linearly from 0 to ½ of the sample rate" is exactly the thing a log x-scale corrects for. Note `scaleLog` cannot have 0 in its domain, so start the domain at the first non-zero bin frequency (`sampleRate/fftSize`).
- **Radial spectra.** `d3.arc()` with `innerRadius` fixed and `outerRadius` driven by bin amplitude gives a radial bar spectrum; `d3.lineRadial().angle(...).radius(...)` with `curveBasis` or `curveCardinalClosed` gives the smooth "blob" spectrum. For a closed radial waveform the first and last samples must be stitched, which is why `curveBasisClosed`/`curveCardinalClosed` are preferable to `curveBasis` for rings.
- **Smoothing has two levers, and they compose.** `analyser.smoothingTimeConstant` smooths in *time* (frame-to-frame); `d3.curveBasis` smooths in *space* (bin-to-bin). Using both is what makes a waveform look "designed" rather than noisy. `curveBasis` is also an approximating (not interpolating) spline, so it will not pass through the data points — fine for aesthetics, wrong if bin values must be read off exactly.
- **rAF vs d3.timer, the honest answer.** For a single visualiser they are equivalent, because d3.timer *is* rAF underneath. d3.timer earns its place when there is more than one animation (e.g. spectrum + decaying peak-hold + a transition), because of the synchronised `d3.now()` and the single shared queue, and because `timer.stop()` gives you a clean teardown handle without storing a rAF id. If the page already uses `d3.transition`, use `d3.timer` so everything shares one clock.
- **Canvas rendering pattern.** `d3.line().context(ctx)` and `d3.arc().context(ctx)` (and the radial equivalents) render straight into a 2D canvas context — this is the single change that converts an SVG-bound d3 sketch into a 60fps-capable one while keeping every scale and curve.

### Gaps
- Cross-browser fidelity: one source reports that "AnalyzerNode is supported in Safari, but does not yield the same output as it does in Chrome" — [Medium/The Startup](https://medium.com/swlh/visualizing-sound-with-d3-and-web-audio-api-435ffea88f30). I could not find a primary (MDN or spec) statement quantifying this, so treat it as an unverified caution worth testing rather than a documented fact.

---

## Q3. Concrete, citable audio-reactive d3 examples — names, links, licences, appearance

### Takeaway
Audio-reactive d3 exists but is a thin, somewhat dated niche: there is no canonical, permissively-licensed flagship example. The best retrievable material is a handful of Observable notebooks (licence **unverifiable** — see Gaps) and three or four blog-post tutorials with inline code. Nothing I found is a maintained, licence-clear library.

### Cited Findings — Observable notebooks
- **Microphone Audio Spectrogram / Jonathan Helfman** — the notebook the others fork from; "The data array holds the results of an FFT transform that updates constantly." A scrolling time-vs-frequency heatmap of live mic input — [observablehq.com/@jonhelfman/microphone-audio-spectrogram](https://observablehq.com/@jonhelfman/microphone-audio-spectrogram)
- **Microphone Audio Spectrogram / Brian Slesinsky** — an explicit fork of Helfman's; prompts the user to "press 'Record' to start the visualization, and grant permission to use the microphone" — [observablehq.com/@skybrian/microphone-audio-spectrogram](https://observablehq.com/@skybrian/microphone-audio-spectrogram)
- **🎤 Spectrogram / Visnu Pitiyanuvath** — spectrogram of microphone input; "grabs frequency domain audio data and writes it to a circular buffer", bins "spread linearly from 0 to ½ of the sample rate". The circular-buffer approach is the idiomatic way to scroll a spectrogram without re-drawing history — [observablehq.com/@visnup/spectrogram](https://observablehq.com/@visnup/spectrogram)
- **Music Viz / Alan Xu** — notable because it splits the job the way this research recommends: it "uses p5.js for spectrum extraction and D3 for visualization", driven from a music URL rather than a mic — [observablehq.com/@alandelip/music-viz](https://observablehq.com/@alandelip/music-viz)

### Cited Findings — tutorials with retrievable inline code
- **Exploring the Web Audio API with D3** (Scott Logic, 6 Jan 2016) — builds the MediaElementSource → Analyser → destination chain and visualises with d3; from the team behind d3fc — [blog.scottlogic.com](https://blog.scottlogic.com/2016/01/06/audio-api-with-d3.html)
- **Music Visualization with D3.js** (Big Nerd Ranch) — uses `Uint8Array` + `getByteFrequencyData` — [bignerdranch.com](https://bignerdranch.com/blog/music-visualization-with-d3-js/)
- **Audio Visualiser Using D3** (Alex Zywiak, GitHub Pages) — drives the render loop with `d3.timer` — [alexzywiak.github.io](https://alexzywiak.github.io/audio-visualiser-using-d3/index.html)
- **Visualizing Sound With D3 and Web Audio API** (Medium / The Startup) — maps frequency to colour via d3 sequential scales; warns that `ScriptProcessorNode` is deprecated — [medium.com/swlh](https://medium.com/swlh/visualizing-sound-with-d3-and-web-audio-api-435ffea88f30)
- **D3.js + React Music Player / Visualizer** (CodePen, teddarcuri) — a d3 + React audio player/visualiser pen — [codepen.io/teddarcuri/pen/EKWMvE](https://codepen.io/teddarcuri/pen/EKWMvE)

### Cited Findings — Observable licensing
- Observable notebooks are **not** permissively licensed by default. Observable staff (jashkenas) describe starting the licence feature "with an intentionally small list of permissive, copyleft and creative commons licenses": MIT, ISC, Apache 2.0, BSD 3-Clause, GNU GPLv3, GNU AGPLv3, GNU LGPLv3, CC BY 4.0 and CC BY-SA 4.0, plus an "Other" escape hatch for any licence text — [talk.observablehq.com "Notebook Licenses"](https://talk.observablehq.com/t/notebook-licenses/3608)
- Forks inherit: staff state "forks inherit the license and copyright notice of their parents" — [talk.observablehq.com](https://talk.observablehq.com/t/notebook-licenses/3608)
- No account-level default existed at the time of that thread: staff said they planned to let accounts "set a default license that should be applied whenever they publish a new notebook" — [talk.observablehq.com](https://talk.observablehq.com/t/notebook-licenses/3608)
- A community member (mootari) characterises the effective default as "proprietary" apart from the Terms-of-Service grant, and notes that the ToS grant "only applies to usage on Observable", so a notebook needs an attached LICENSE to be reusable off-platform — [talk.observablehq.com "Copyright and software licenses"](https://talk.observablehq.com/t/copyright-and-software-licenses/364)
- Permissive Observable code does exist in bulk where it has been deliberately licensed: Observable staff have said that over four hundred D3 notebooks were released under ISC — [talk.observablehq.com](https://talk.observablehq.com/t/notebook-licenses/3608)

### Inferences
- **Practical rule for re-use:** treat any Observable notebook as all-rights-reserved unless its own page shows a licence. The `@d3` organisation's notebooks are the safe pool (ISC); random user notebooks are not. For this project the notebooks above are best used as *reference reading*, with the code written fresh, rather than copied.
- The thinness of this niche is itself a finding worth reporting: almost every "audio visualiser" in the JS ecosystem is Canvas/WebGL/three.js, not d3. The search for an MIT-licensed "audio-reactive d3" GitHub repo returned MIT-licensed spectrum visualisers (`Sanjays2402/sound-spectrum`, `lawchli/Spectrum-3D`, `simonwep/spectrum`, `mattdesl/spectrum`, `sandner-art/Audio-Shader-Studio`) — **none of which use d3**; they use Canvas or WebGL.
- Reading that signal honestly: the ecosystem has already converged on "d3 for mapping, canvas/WebGL for pixels" by simply skipping d3 entirely for this use case. Using d3's scales and shape generators on a canvas is therefore a *deliberate* design choice (it buys you clean, readable mapping code and axis/legend machinery), not the ecosystem default.

### Gaps
- **Licences on the four named Observable notebooks could not be verified.** observablehq.com is behind a Vercel bot checkpoint ("Vercel Security Checkpoint — We're verifying your browser"), which blocked both WebFetch (HTTP 429) and curl. The report must not state a licence for the Helfman / Slesinsky / Visnu / Alan Xu notebooks.
- **Observable's current official licensing documentation page could not be retrieved** (`observablehq.com/documentation/collaboration/licenses` — repeated HTTP 429 and bot challenge). The findings above come from the official Observable forum with named staff participants, which is authoritative but dates from roughly 2020–2022. The present-day default and the selectable list may have changed.
- **bl.ocks.org:** I did not verify its current status and found no primary source on it in this research, so the report should not claim anything about whether bl.ocks.org archives are still live. (It was a gist-rendering proxy, so any surviving code is on gist.github.com regardless.)
- Licences on the blog-post tutorials and the CodePen pen are not stated by their sources; CodePen pens carry no licence unless the author adds one. Treat all as read-only reference.

---

## Q4. d3's licence and CDN availability

### Takeaway
d3 is ISC-licensed (permissive, MIT-equivalent) and is explicitly designed for CDN script-tag use with no build step — a perfect fit for a static Netlify site.

### Cited Findings
- **Licence: ISC.** Verified against the LICENSE file in the d3 repo, which reads "Copyright 2010-2026 Mike Bostock / Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies." — [github.com/d3/d3/blob/main/LICENSE](https://raw.githubusercontent.com/d3/d3/main/LICENSE)
- Current release at time of writing: **7.9.2**, shown on the getting-started page header — [d3js.org/getting-started](https://d3js.org/getting-started)
- **Recommended CDN form (ESM):** "We recommend using the CDN-hosted ES module bundle." — `import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";` inside `<script type="module">` — [d3js.org/getting-started](https://d3js.org/getting-started)
- **Plain script-tag form (UMD):** a UMD bundle "that exports the `d3` global when loaded as a plain script" — `<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>` — [d3js.org/getting-started](https://d3js.org/getting-started)
- **Per-module ESM:** `import {forceSimulation, forceCollide, forceX} from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";` — [d3js.org/getting-started](https://d3js.org/getting-started)
- **Self-hosting:** downloadable UMD bundles `d3.v7.js` (non-minified, for debugging) and `d3.v7.min.js` (minified, for production) can be referenced locally with `<script src="d3.js"></script>` — [d3js.org/getting-started](https://d3js.org/getting-started)
- npm (`npm install d3`, `import * as d3 from "d3"`) is presented as needed only for Node-based web apps; d3 "works in any JavaScript environment" — [d3js.org/getting-started](https://d3js.org/getting-started)

### Inferences
- ISC imposes one obligation: keep the copyright and permission notice in all copies. Loading `d3@7` from jsDelivr satisfies this automatically, since the notice is in the served bundle. Self-hosting the minified file also satisfies it (the banner comment is retained). There is no attribution requirement on the rendered page and no copyleft.
- For this project's constraints the per-module ESM import is attractive: `d3-scale` + `d3-shape` + `d3-timer` is a fraction of the full bundle, and nothing else in d3 is needed if rendering to canvas.
- jsDelivr is the only CDN d3's own docs recommend; unpkg also serves npm packages but is not endorsed on that page.

### Gaps
- The getting-started page does not mention unpkg, so I cannot cite an official unpkg form for d3.

---

## Q5. p5.js licence, CDN availability, and the current state of p5.sound (1.x vs 2.x) — exact script tags

### Takeaway
This is the single most consequential finding for a no-build-step site: **p5.sound is no longer bundled with p5.js and has been rewritten from scratch on top of Tone.js.** You need two separate script tags, and the new p5.sound 0.4.x has a *much smaller* analysis API than the one every tutorial on the internet documents — `getEnergy()`, `getCentroid()` and `linAverages()` no longer exist.

### Cited Findings — licence (verified)
- **p5.js is LGPL-2.1.** The `license.txt` in the p5.js repo is the "GNU LESSER GENERAL PUBLIC LICENSE / Version 2.1, February 1999" — [github.com/processing/p5.js license.txt](https://raw.githubusercontent.com/processing/p5.js/dev-2.0/license.txt)
- Independently confirmed by registry metadata: the npm `p5` package declares `"license": "LGPL-2.1"` (checked for 2.4.0 via registry.npmjs.org on 2026-11-27) — [registry.npmjs.org/p5](https://registry.npmjs.org/p5)
- **p5.sound is also LGPL-2.1.** The p5.sound.js repo README states LGPL-2.1 — [github.com/processing/p5.sound.js](https://github.com/processing/p5.sound.js); the npm `p5.sound` package declares `"license": "LGPL-2.1"` for 0.4.2 — [registry.npmjs.org/p5.sound](https://registry.npmjs.org/p5.sound)
- The legacy p5.sound source likewise carries an LGPL notice — the FFT class is noted as "open source under the LGPL" — [processing/p5.js-sound src/fft.js](https://github.com/processing/p5.js-sound/blob/main/src/fft.js)

### Cited Findings — versions and dates (registry metadata, checked 2026-11-27)
- `p5` latest is **2.4.0**, published **2026-11-11** — [registry.npmjs.org/p5](https://registry.npmjs.org/p5)
- The 1.x line is still being patched: last 1.x versions are 1.11.11 (2025-10-20), 1.11.12 (2026-03-30), **1.11.13 (2026-04-08)** — [registry.npmjs.org/p5](https://registry.npmjs.org/p5)
- `p5.sound` latest is **0.4.2**, published **2026-11-08**; full published version list: 0.1.0-beta, 0.1.0, 0.2.0, 0.3.0-rc.0, 0.3.0, 0.4.0, 0.4.1, 0.4.2 — [registry.npmjs.org/p5.sound](https://registry.npmjs.org/p5.sound)
- p5.js 1.x "will continue to be supported until August, 2026" per the p5.js compatibility material surfaced in search — [processing/p5.js-compatibility](https://github.com/processing/p5.js-compatibility) *(see Gaps — the exact wording was taken from a search summary, not a direct page fetch, and the date has now passed)*

### Cited Findings — the split, and the exact script tags
- "p5.sound.js is maintained as a separate library from p5.js." — [p5js.org/download](https://p5js.org/download/)
- Add it "in addition to" p5.js if your sketch needs sound — [p5js.org/download](https://p5js.org/download/)
- **The bundled copy is a trap:** the p5.sound.js inside the "Complete Library" download "is an outdated version incompatible with p5.js 2.x", so ignore it and use the CDN link — [p5js.org/download](https://p5js.org/download/)
- Official CDN URLs given on the download page:
  - p5.js pinned: `https://cdn.jsdelivr.net/npm/p5@2.4.0/lib/p5.min.js`
  - p5.js floating 2.x: `https://cdn.jsdelivr.net/npm/p5@2/lib/p5.min.js` — "Use the following URL if you'd like to ensure that you're always accessing the latest version of p5.js 2.x."
  - p5.sound: `https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js`
  — [p5js.org/download](https://p5js.org/download/)
- The download page links to the v1 reference separately ("Looking for p5.js v1 reference? Find it here!" → `https://v1.p5js.org`) and lists no 1.x CDN URL — [p5js.org/download](https://p5js.org/download/)
- The p5.sound.js README says it "work[s] with both p5.js version 2 and version 1" — [github.com/processing/p5.sound.js](https://github.com/processing/p5.sound.js)
- Release-notes detail: p5.sound.js 0.1.0 "supports both `preload()` as used in p5.js 1.x, and async/await as used in p5.0" — [processing/p5.sound.js releases](https://github.com/processing/p5.sound.js/releases)
- The new library is "a minimal abstraction of the Tone.js library with a feature set that is inspired by p5.js's approach to accessible and poetic creative coding" — [github.com/processing/p5.sound.js](https://github.com/processing/p5.sound.js)
- p5.js 2.0 changed asset loading; 1.x `preload()` usage "remain[s] available with the preload.js compatibility add-on library" — [processing/p5.js-compatibility](https://github.com/processing/p5.js-compatibility)

### Inferences — the exact script tags to use today
For a static, no-build, CDN-only page in late 2026, this is the minimal correct head (both URLs taken verbatim from p5js.org/download):

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2.4.0/lib/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.min.js"></script>
```

Pin both versions rather than using `p5@2`, because p5.sound 0.4.x is a 0.x library tracking a moving target: `p5@2` floating plus a pinned p5.sound invites a silent break on a future p5 minor. Load p5 **before** p5.sound (p5.sound attaches to `p5.prototype`, verified in the bundle: `p5.prototype.getAudioContext = getAudioContext, p5.prototype.setAudioContext = setAudioContext`).

### Inferences — LGPL and a CDN script tag
- The LGPL's copyleft attaches to the *library*, not to the work that uses it. Loading p5.js from jsDelivr with a `<script>` tag is dynamic linking in the plainest possible sense: the library is a separate, unmodified file served from a third party, and the site's own JS is a separate work that calls into it. LGPL-2.1 §6 is satisfied by that arrangement; nothing obliges the site's own source to be LGPL, and the site's code can be any licence or none.
- Bundling/concatenating/minifying p5.js *into* your own JS file is the case that invites LGPL §6 obligations (you must still allow the user to relink against a modified p5, typically discharged by keeping p5 as a separate file and shipping the notice). Since the project has no build step, this does not arise.
- Modifying p5.js or p5.sound themselves and shipping the modification does trigger copyleft on the modified library files.
- Practical conclusion for this project: CDN script tags are clean. Keep the LGPL notice/attribution visible somewhere (a credits line or a comment) as good practice; there is no obligation to open-source the site.
- These are reasoned applications of LGPL-2.1 text, not quotations from a legal source — flag as such in the report, and note that the Processing Foundation does not publish a licensing-FAQ page addressing CDN use that I could find.

### Gaps
- I did not find an official Processing Foundation statement interpreting the LGPL for CDN/script-tag use. The LGPL analysis above is an inference from the licence text.
- The p5.js 1.x end-of-support date ("August, 2026") comes from a search-result summary of the p5.js-compatibility repo rather than a direct fetch, and that date is now in the past; the report should either re-verify it or describe 1.x as "no longer the supported line, though still receiving occasional patches through April 2026 per npm metadata".
- The p5js.org download page does not explicitly assert that p5.sound 0.4.2 is compatible with p5.js 2.x — it only says the *bundled* copy is incompatible. Compatibility rests on the p5.sound.js README's "works with both version 2 and version 1".

---

## Q6. p5.sound analysis API, and pointing it at an external AudioNode / sharing an AudioContext

### Takeaway
**Yes — and this is explicitly supported and documented.** The new p5.sound 0.4.x ships `setAudioContext()` / `getAudioContext()` as a *documented cross-library feature*, with a worked Tone.js example in the source's own JSDoc, and its `setInput()` unwraps foreign nodes down to a bare `AudioNode`. The legacy p5.sound (1.x) is even more explicit: `p5.FFT.setInput()`'s JSDoc names "web audio API source node" as an accepted argument. The catch is that the new analysis API is far leaner than the old one.

### Cited Findings — the new (2.x-era) p5.sound 0.4.2 API surface
Verified by inspecting the actual shipped bundle, `https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js`, and cross-checked against the live reference index at [p5js.org/reference/p5.sound](https://p5js.org/reference/p5.sound/):

- Top-level functions: `loadSound()`, `clamp()`, `createContext()`, `ensureContext()`, `getAudioContext()`, `resolveInput()`, `resolveOutput()`, `setAudioContext()`, `userStartAudio()`, `userStopAudio()` — [p5js.org/reference/p5.sound](https://p5js.org/reference/p5.sound/)
- `p5.FFT` lists only two methods: `analyze()` and `waveform()` — [p5js.org/reference/p5.sound](https://p5js.org/reference/p5.sound/)
- `p5.Amplitude` lists `getLevel()`, `setInput()`, `smooth()`; `p5.AudioIn` lists only `start()` and `stop()` — [p5js.org/reference/p5.sound](https://p5js.org/reference/p5.sound/)
- `setInput()` is a method of `p5.Amplitude` and of the base class `p5.p5soundNode` (which also has `amp()`, `connect()`, `disconnect()`, `getNode()`) — it is not a top-level function — [p5js.org/reference/p5.sound](https://p5js.org/reference/p5.sound/)
- **`p5.FFT` constructor: `p5.FFT([fftSize])`, where fftSize "Must be a power of two between 16 and 1024" and defaults to 32** — [p5js.org/reference/p5.sound/p5.FFT](https://p5js.org/reference/p5.sound/p5.FFT/)
- `analyze()` "Returns the frequency spectrum of the input signal" as an "Array of amplitude values from 0 to 1" (per the JSDoc in the shipped bundle) — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- Implementation detail from the bundle: `p5.FFT` extends `p5soundNode`, constructs `new FFT$1({size: fftSize, normalRange: true})` (Tone's FFT) plus a `Waveform`, and routes both through a single `Gain` node. `normalRange: true` means `getValue()` applies `dbToGain(v)`, which is why the range is 0–1 rather than decibels — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- **`getEnergy()`, `getCentroid()` and `linAverages()` are entirely absent from the 0.4.2 bundle** — grep of the full 797 KB file returns 0 occurrences of each — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- Other classes carried over as deprecated stubs via `createDeprecatedClass(...)`: `MonoSynth`, `EQ`, `Convolver`, `Distortion`, `OnsetDetect`, `Filter`, `Effect`, `Compressor`, `AudioVoice`, `Part`, `Phrase`, `PolySynth`, `Pulse`, `Score`, `SoundLoop` — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- `p5.sound`'s FFT example in its own JSDoc connects source to analyser via `osc.connect(fft)` and maps spectrum values with `map(spectrum[i], 0, 0.1, height, 0)` — note the 0–0.1 working range, i.e. real-world values occupy the bottom of the 0–1 scale — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)

### Cited Findings — context sharing is a first-class, documented feature
The JSDoc shipped inside p5.sound 0.4.2 states this directly (quotations from the bundle):

- On `getAudioContext()`: hand the context to the other library's "own context setter before creating any of its objects — `Tone.setContext(getAudioContext())` for Tone.js — and nodes from both libraries can then be connected to each other." Its example comments read "hand p5.sound's context to Tone.js, loaded from its own script tag, before making any Tone.js object" and then `rev.setInput(synth)` where `synth` is a `Tone.MembraneSynth` — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- On `setAudioContext(ctx)`: "Sets the audio context to a specified context to enable cross library compatibility. Accepts an AudioContext, an OfflineAudioContext, or a Tone.js Context. A raw AudioContext supplied here gets the same Firefox fixes". Its example: `ctx = new AudioContext(); setAudioContext(ctx);` with the comment "route p5.sound.js through an audio context the sketch owns" and "nodes created from here on play through that context" — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- Implementation: `function setAudioContext(ctx) { context = ctx, polyfillAudioListener(ctx), setContext(ctx); }` — it reassigns p5.sound's module-level context and hands it to Tone's `setContext` — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- Both are installed on the p5 prototype: `p5.prototype.getAudioContext = getAudioContext, p5.prototype.setAudioContext = setAudioContext` — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- There is an **official p5.js example** dedicated to exactly this: "Connecting to ToneJS — Works with AudioContexts and cross-library synthesis", which shows both libraries loaded via separate script tags in `<head>`, explains that you "get the AudioContext from p5.sound.js and share it with Tone.js, so both libraries work in the same audio network", and compares an AudioContext to a canvas: audio nodes created with the same context can be patched together in one network — [p5js.org/examples/Sound-Connecting-To-ToneJS](https://p5js.org/examples/Sound-Connecting-To-ToneJS/)

### Cited Findings — what `setInput()` actually accepts (new p5.sound)
From the bundle's `p5soundNode.setInput` implementation:
```js
setInput(source) {
  "function" != typeof source.getNode
    ? connect((function (node) {
        for (; node && !isAudioNode(node) && void 0 !== node.output; ) node = node.output;
        return node;
      })(source), resolveInput(this.input))
    : source.connect(this.input);
}
```
— [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)

- The private helper `resolveInput(node)` is documented as "a private helper function that 'unwraps' Tone.js nodes with a `this.input` property until it reaches a bare audio node that a plain Web Audio `connect()` can target" — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- `isAudioNode(arg)` delegates to `isAnyAudioNode(arg)` (standardized-audio-context) — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js)
- The public JSDoc for `setInput` is vaguer than the code: `@param {Object} input The node you would like to use as an input` — [p5.sound 0.4.2 bundle](https://cdn.jsdelivr.net/npm/p5.sound@0.4.2/dist/p5.sound.js); for Amplitude it reads "Connect an audio source to the amplitude object… @param {Object} input - An object that has audio output" — [p5js.org/reference/p5.sound](https://p5js.org/reference/p5.sound/)

### Cited Findings — legacy p5.sound (p5.js 1.x) is explicit about raw Web Audio nodes
- `p5.FFT.setInput` JSDoc: "Set the input source for the FFT analysis. If no source is provided, FFT will analyze all sound in the sketch. @param {Object} [source] p5.sound object (or web audio API source node)" — [processing/p5.js-sound src/fft.js](https://github.com/processing/p5.js-sound/blob/main/src/fft.js)
- Implementation: it checks `source.output` first (p5.sound objects), falls back to `source.connect` (which any Web Audio node has) and calls `source.connect(this.analyser)`, then disconnects the global `fftMeter` — [processing/p5.js-sound src/fft.js](https://github.com/processing/p5.js-sound/blob/main/src/fft.js)
- Legacy constructor: `constructor(smoothing, bins)` wrapping `p5sound.audiocontext.createAnalyser()`, with `bins` defaulting to 1024 and `freqDomain`/`timeDomain` as `Uint8Array` — so legacy `analyze()` returns **0–255 over 1024 bins** by default — [processing/p5.js-sound src/fft.js](https://github.com/processing/p5.js-sound/blob/main/src/fft.js)
- Legacy v1 reference confirms: constructor `p5.FFT([smoothing], [bins])`, smoothing 0.0–1.0 default 0.8, bins a power of two 16–1024 default 1024; `analyze()` returns 0–255; `waveform()` returns -1.0 to +1.0; `getEnergy()` accepts Hz, a Hz range, or the named bands "bass", "lowMid", "mid", "highMid", "treble" and returns 0–255; `getCentroid()` returns the spectral centroid; `linAverages(N)` returns N equal bands (default 16); `logAverages()` groups into octave bands — [v1.p5js.org p5.FFT](https://v1.p5js.org/reference/p5.sound/p5.FFT/)
- Legacy hard-coded band edges, from the source: bass `[20,140]`, lowMid `[140,400]`, mid `[400,2600]`, highMid `[2600,5200]`, treble `[5200,14000]` — [processing/p5.js-sound src/fft.js](https://github.com/processing/p5.js-sound/blob/main/src/fft.js)
- `getEnergy(f1, f2)` returns 0–255, throws on invalid input, and requires `analyze()` to have been called first; `getCentroid()` likewise requires a prior `analyze()` — [processing/p5.js-sound src/fft.js](https://github.com/processing/p5.js-sound/blob/main/src/fft.js)

### Inferences — the direct answer to the Strudel question
- **Can p5.sound analyse an AudioNode that another library created? Yes, by sharing the context, and p5.sound is unusual in documenting this explicitly.** Two routes:
  1. **p5.sound owns the context, Strudel adopts it.** Call `getAudioContext()` and hand it to the other library before that library creates any nodes — exactly the `Tone.setContext(getAudioContext())` pattern in p5.sound's own docs.
  2. **Strudel owns the context, p5.sound adopts it.** Call `setAudioContext(strudelCtx)` *before* creating any p5.sound object. This is the route that fits the project's constraint, since Strudel/superdough creates and owns its context. `@strudel/webaudio` exports `getAudioContext`, `initAudioOnFirstClick` and `webaudioOutput`, and its own documented setup calls `getAudioContext()` and passes `ctx.currentTime` to the scheduler — [npm @strudel/webaudio](https://www.npmjs.com/package/@strudel/webaudio); custom sounds registered with `registerSound` likewise call `getAudioContext()` — [Strudel technical manual: Sounds](https://strudel.cc/technical-manual/sounds/). So Strudel's context is obtainable from page JS.
- **Ordering is the whole game.** `setAudioContext` only reassigns the module-level `context`; nodes already built on the old context are stranded, because Web Audio nodes cannot be connected across contexts. Call `setAudioContext(strudelContext)` once, before any `new p5.FFT(...)`, `new p5.Oscillator(...)` or `loadSound(...)`.
- **A raw `AudioNode` passed to the new `setInput()` works, by a slightly accidental route.** Trace the code: a raw node has no `getNode`, so the unwrap branch runs; the unwrap loop's guard `!isAudioNode(node)` is immediately false for a bare `AudioNode`, so the loop body never executes and the node is returned as-is; `connect(rawNode, resolveInput(this.input))` then does the real work. So raw nodes are handled — but only because `isAudioNode()` short-circuits, not because the JSDoc promises it. Legacy p5.sound promises it in writing; new p5.sound does not. Treat raw-node `setInput()` on 0.4.x as working-but-undocumented and verify it in the browser.
- **The simplest and most robust pattern, avoiding p5.sound's ambiguity entirely:** don't use p5.FFT at all for a foreign source. Build a plain `AnalyserNode` on Strudel's own context (`strudelCtx.createAnalyser()`), tap Strudel's output into it, and read `getByteFrequencyData` yourself. This is the same code path d3 would use, works identically for p5.js drawing and d3 mapping, costs one script tag less, and sidesteps every version question about p5.sound 0.x. p5.js then becomes purely a drawing library.
- **If you do use p5.FFT 0.4.x, expect to rewrite tutorial code.** Default `fftSize` is 32, not 1024; the max is 1024, not 16384; `analyze()` returns 0–1 (realistically clustered near 0–0.1, as p5's own example's `map(spectrum[i], 0, 0.1, …)` concedes), not 0–255; and `getEnergy('bass')`, `getCentroid()` and `linAverages()` are gone. Every "p5 audio visualiser" tutorial written before ~2024 targets the legacy API and will not run.
- Replacing the lost helpers is straightforward arithmetic: band energy is a mean over the bins whose centre frequencies fall in the band, using `binFreq(i) = i * sampleRate / (2 * size)`; spectral centroid is `Σ(freq_i · mag_i) / Σ(mag_i)`. Hard-code the legacy band edges above if you want visual parity with old sketches.
- `userStartAudio()` resolves to `globalContext.resume()` in the bundle, i.e. it is just a context resume from a user gesture; if Strudel already handled the gesture (`initAudioOnFirstClick`), p5.sound's version is redundant.

### Gaps
- I did **not** empirically test `p5.FFT.setInput(rawAudioNode)` or `setAudioContext(strudelCtx)` in a browser; both conclusions are read off the shipped source. A smoke test on the real page is warranted.
- I found no official documentation page for p5.sound 0.4.x that lists `setInput`'s accepted types for `p5.FFT` — the p5.FFT reference page documents only the constructor, `analyze()` and `waveform()`, has an empty Examples section, and mentions `setInput` only under "Related References" pointing at `p5.Amplitude` — [p5js.org/reference/p5.sound/p5.FFT](https://p5js.org/reference/p5.sound/p5.FFT/)
- I found no Strudel documentation page that explicitly blesses attaching a third-party analyser to its output graph; the conclusion rests on `@strudel/webaudio` exporting `getAudioContext` and on superdough being ordinary Web Audio. One secondary source notes superdough's options "let you supply your own `context` in place of `new AudioContext`" — [GitHub rn-strudel](https://github.com/wwrinkle/rn-strudel) — but that is a React Native port, not Strudel's own docs.
- Which node to tap for Strudel's master output (a named destination/gain vs. the raw `ctx.destination`) is not documented in anything I retrieved. Note that you cannot tap `ctx.destination` itself — an analyser must sit in the path *before* destination, or be fed from a gain node that also feeds destination.

---

## Q7. Notable open-source p5.js audio-reactive sketches with retrievable code and licences

### Takeaway
The official p5.js examples collection is the best-licensed and most current source (CC BY-NC-SA 4.0 — note the NonCommercial clause), including one example written specifically for the cross-library AudioContext case. OpenProcessing is a huge but licence-encumbered pool: its default is CC BY-NC-SA.

### Cited Findings — official p5.js examples (Sound category, 8 examples)
From [p5js.org/examples](https://p5js.org/examples/):
- **Making a Beep** — creating tones with an Oscillator (`/examples/Sound-Coding-Beeps/`)
- **Filtering Sound** — simulates waves and wind with white noise (`/examples/Sound-Filtering-Sound/`)
- **Playing Melodies** — melodic music from an array of pitch values (`/examples/Sound-Playing-Melodies/`)
- **Echo Synth** — a short sound with an echo effect (`/examples/Sound-Echo-Synth/`)
- **Sample Playback** — loads a soundfile and changes its properties (`/examples/Sound-Sample-Playback/`)
- **Measuring Amplitude (Visualization)** — "Analyzes sound amplitude with p5.Amplitude" (`/examples/Sound-Measuring-Amplitude/`)
- **Visualizing Sound** — "Spectral analysis for audio-responsive animations" (`/examples/Sound-Visualizing-Sound/`)
- **Connecting to ToneJS** — "Works with AudioContexts and cross-library synthesis" (`/examples/Sound-Connecting-To-ToneJS/`)
- **Licence of the examples: CC BY-NC-SA 4.0**, credited to "p5.js Contributors and the Processing Foundation" — [p5js.org/examples/Sound-Connecting-To-ToneJS](https://p5js.org/examples/Sound-Connecting-To-ToneJS/)

### Cited Findings — OpenProcessing's licence model
- **Default: CC BY-NC-SA** (Attribution, NonCommercial, ShareAlike). "the Attribution Noncommercial ShareAlike (BY-NC-SA) is the default license on OpenProcessing" — [OpenProcessing help: Choosing a License for Your Sketches](https://intercom.help/openprocessing/en/articles/5714786-choosing-a-license-for-your-sketches)
- Other options described there: **BY-SA** (commercial and non-commercial reuse allowed, derivatives must carry the same licence) and **BY-NC** (non-commercial only, derivatives need not share alike) — [OpenProcessing help](https://intercom.help/openprocessing/en/articles/5714786-choosing-a-license-for-your-sketches)
- Authors can bulk-apply a chosen CC licence to all their sketches via Edit Profile → Advanced Settings — [OpenProcessing help](https://intercom.help/openprocessing/en/articles/5714786-choosing-a-license-for-your-sketches)
- Sketch pages in search results consistently display BY-NC-SA, linking to the Creative Commons **3.0** version, though individual authors sometimes choose BY-SA, so per-sketch licences must be read individually — e.g. [openprocessing.org/sketch/621449](https://openprocessing.org/sketch/621449)

### Cited Findings — community teaching material
- **The Coding Train, "Sound Visualization: Frequency Analysis with FFT"** is the best-known p5 audio-reactive tutorial track — [thecodingtrain.com](https://thecodingtrain.com/tracks/sound/sound/11-sound-visualization-frequency-analysis)
- **Codrops, "Creative Audio Visualizers"** (2018) is a widely-cited roundup of the technique — [tympanus.net/codrops](https://tympanus.net/codrops/2018/03/06/creative-audio-visualizers/)
- **Observable "Music Viz"** combines p5.js for spectrum extraction with d3 for drawing — directly relevant as a hybrid precedent — [observablehq.com/@alandelip/music-viz](https://observablehq.com/@alandelip/music-viz)

### Inferences
- The **CC BY-NC-SA** licence on both the official p5.js examples and OpenProcessing's default is a real constraint worth flagging to the report-writer: NonCommercial. For a personal/artist site it is almost certainly fine, but a site that sells anything (e.g. a Bandcamp-linked storefront) is arguably commercial, and ShareAlike propagates to derivative works. Code *patterns* and API usage are not copyrightable; verbatim example code is. The safe posture: read the examples, write your own.
- The official examples also carry a hidden maintenance advantage: they are kept current against p5.js 2.x / p5.sound 0.4.x, unlike essentially all third-party tutorials (The Coding Train's FFT track and the 2018 Codrops article both predate the p5.sound rewrite and will use `getEnergy()`-era APIs).
- "Visualizing Sound" and "Connecting to ToneJS" are the two examples that matter for this project: the first for the FFT-to-geometry mapping, the second because it is literally the documented answer to "can p5.sound analyse another library's audio".

### Gaps
- **OpenProcessing's Terms of Service page returned HTTP 403** to automated fetching, so I could not verify the default licence against the ToS itself — only against the (roughly five-year-old) help-centre article. The report should attribute the BY-NC-SA default to the help centre and note it may have changed.
- I did not identify specific named creative coders' audio-reactive repos with verified licences. The task's "well-known creative coders who publish source" angle is under-covered: searches for audio-reactive repos surfaced Canvas/WebGL projects rather than p5.js ones. This is a genuine gap, not a conclusion that none exist.
- The p5.js examples page does not name FFT explicitly for "Visualizing Sound" (it says "spectral analysis"), so the FFT attribution there is an inference.

---

## Q8. The Processing-to-web story, settled

### Takeaway
There is no route from a Java Processing sketch to a website today. Every bridge that ever existed is archived or removed: Processing.js was archived **5 December 2018**; JavaScript Mode was moved out of the Processing IDE after 2.0 beta 8; Processing 4's only export is a native Java application. The web story *is* p5.js, and p5.js is a reimplementation that requires rewriting the sketch in JavaScript.

### Cited Findings — (a) p5.js
- p5.js is not a port: "p5.js is a new interpretation, not an emulation or port, and it is in active development" — per p5.js docs as surfaced via [Happy Coding, "Which Processing should I use?"](https://happycoding.io/tutorials/p5js/which-processing)
- Function names differ, so sketches need rewriting — e.g. p5.js uses `createCanvas()` where Processing uses `size()` — [Happy Coding](https://happycoding.io/tutorials/p5js/which-processing)
- It is actively maintained: p5 2.4.0 published 2026-11-11 — [registry.npmjs.org/p5](https://registry.npmjs.org/p5)

### Cited Findings — (b) processing.js: dead, with a date
- **Archived 5 December 2018.** The GitHub page states: "This repository was archived by the owner on Dec 5, 2018. It is now read-only." — [github.com/processing-js/processing-js](https://github.com/processing-js/processing-js)
- README banner: "⚠️ This project has been archived ⚠️" — [github.com/processing-js/processing-js](https://github.com/processing-js/processing-js)
- README rationale: "...as well as Processing.js itself having been in maintenance mode for quite a few years now, this project has been archived as of December 2018." The maintainers also cited the growth of p5.js — [github.com/processing-js/processing-js](https://github.com/processing-js/processing-js)
- Final version: "the last version is, and will forever be, v1.6.6" — [github.com/processing-js/processing-js](https://github.com/processing-js/processing-js)
- The npm package is marked deprecated with the notice "This project has been archived. Please use p5js instead." — [npmjs.com/package/processing-js](https://www.npmjs.com/package/processing-js)
- Processing.js "doesn't support any new Processing 3 features, and is no longer actively developed" — [Happy Coding](https://happycoding.io/tutorials/p5js/which-processing)
- Fallout: a Processing.js deprecation entry exists in ZKM's Net Art Extinction Timeline, claiming 100,000+ browser sketches affected — [extinction.zkm.de](https://extinction.zkm.de/events/processing-js-deprecated/) *(that page is labelled AI-researched and its p5.js release date conflicts with other sources; treat the 100,000 figure as unverified)*

### Cited Findings — (c) JavaScript Mode in the Processing IDE: removed
- The repository's own description records the whole arc: "Former ProcessingJS mode (Processing 1.5) that became JavaScript mode (Processing 2.0 beta) that has now been moved out of the Processing IDE." — [github.com/fjenett/javascript-mode-processing](https://github.com/fjenett/javascript-mode-processing)
- It was internal "until 2.0 beta 8" — [github.com/fjenett/javascript-mode-processing](https://github.com/fjenett/javascript-mode-processing)
- The Processing 3 editor "no longer shows 'JavaScript mode' for Processing.js, which means you can no longer deploy to the web from the IDE" — [Processing forum, "JavaScript Mode removed?"](https://forum.processing.org/two/discussion/11928/javascript-mode-removed)
- The community-maintained standalone mode was broken against Processing 3: users reported "the message returned is '0.3.3 not compatible'", and the issue tracker carries an open issue "0.3.3 NOT Compatible with Processing 3.0" — [github.com/fjenett/javascript-mode-processing/issues](https://github.com/fjenett/javascript-mode-processing/issues)
- Contemporary advice was to rewrite in p5.js, since Processing.js "is no longer maintained and will likely stop working with a future release of Processing or JavaScript" — [Happy Coding](https://happycoding.io/tutorials/p5js/which-processing)

### Cited Findings — (d) Processing 4: no web export
- The current Processing environment reference lists **Export Application** as the only export: it "Exports a Java application as an executable file and opens the folder containing the exported files." The other output-related items are Archive Sketch (zip of the sketch) and Movie Maker (movie from an image sequence). The Export section points to a Wiki page for exporting applications from **Java mode**. The page does not mention JavaScript mode or any web export; it notes only that other programming modes can be added through "Add Mode..." without naming any — [processing.org/environment](https://processing.org/environment/)

### Inferences
- **Plain statement for the report: no, a Java Processing sketch cannot run on a website today.** There is no supported route. The three historical routes are all closed: Processing.js (archived Dec 2018, v1.6.6, never supported Processing 3+ features), IDE JavaScript Mode (removed after 2.0 beta 8, the standalone successor incompatible with Processing 3), and a web export in the IDE (never existed in 4.x; Export Application produces a native Java executable).
- The only honest options today are (1) rewrite the sketch in p5.js — the officially blessed path, requiring real translation work because p5.js is a reinterpretation with different function names, not a transpiler; or (2) run the Java sketch offline and publish a video/image capture, for which Processing's own Movie Maker tool exists.
- Theoretically a Java sketch could be compiled to WebAssembly via a Java-to-WASM toolchain, but I found **no source** indicating anyone does this for Processing, and Processing's AWT/OpenGL dependencies make it implausible. The report should not offer this as a route.
- Dating note for the report: Processing.js's archival (Dec 2018) is nine years before the time of writing, and JavaScript Mode's removal predates it by several more. This is a settled historical question, not a live one — which is precisely why so much surviving documentation and so many tutorials point at dead tooling.

### Gaps
- I could not find a Processing 4 release note or official statement *explicitly* saying "there is no web export" — the conclusion rests on the absence of any such option from the official environment reference, which lists Export Application only. That is strong negative evidence from a primary source, but it is negative evidence.
- Most JavaScript Mode sources are forum posts from roughly 2015–2020. They are consistent with each other and with the primary repo description, but no single authoritative "JavaScript Mode is discontinued" announcement page was located.
- The p5.js release year is inconsistent across sources (2013 vs 2014 — [extinction.zkm.de](https://extinction.zkm.de/events/processing-js-deprecated/) says 2014); I did not resolve this, and it is not load-bearing.
