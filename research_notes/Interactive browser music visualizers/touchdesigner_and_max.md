# TouchDesigner and Max/MSP on the Open Web

*All vendor pages observed 2026-11-27.*

---

## Q1. Is there any browser runtime, WebAssembly build, web player, or web export for TouchDesigner networks?

### Takeaway
No. As of 2026-11-27 Derivative ships **no** browser runtime, no WebAssembly build, no web player and no web export for TouchDesigner networks. Every "TouchDesigner on the web" path is either (a) a live stream/socket from a running TouchDesigner machine, or (b) pre-rendered media. There is no artefact you can upload to Netlify that *is* a TouchDesigner network.

### Cited Findings
- Derivative's own export/output documentation describes only file outputs (movies, image sequences, GIF) and live network protocols. The Movie File Out TOP page lists containers `mov`, `mp4`, `mkv`, `webm` and image-sequence output — no browser/WASM target — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)
- The nearest thing to an in-browser TouchDesigner is a **user-posted question** on Derivative's forum asking whether Derivative plans a browser-based "TouchDesigner Player" built on WebGL/three.js. No Derivative staff reply appears in the thread and no such product is confirmed. Replies are community speculation: "Sorry but I doesn't see what would be the advantage ?" (jacqueshoepffner) and "One obvious win for me would be the platform independence." (ulgens) — [Derivative forum, "A Web TD Player? Treejs based?"](https://forum.derivative.ca/t/a-web-td-player-treejs-based/991083)
- TouchDesigner's own embedded browser works in the *opposite* direction — it pulls web content *into* TouchDesigner. The `webBrowser` palette component is "currently available on Windows only, in the Commercial, Educational and Pro versions" — [Derivative, Palette:webBrowser](https://derivative.ca/UserGuide/Palette:webBrowser)
- TouchEngine, Derivative's embedding technology, "allows other software packages to load TouchDesigner components from .tox files, process them, and pass data back and forth." Its SDK platforms are **Windows and macOS only**; the page makes **no mention of web or browser support**. Hosts listed: Unreal Engine plugin, SMODE, VDMX, Resolume (FFGLTouchEngine), Screenberry, Hippotizer, LightAct, Pixera, TouchPy (Python) — [Derivative, TouchEngine](https://derivative.ca/UserGuide/TouchEngine)
- TouchEngine also still requires a local TouchDesigner/TouchPlayer install: "There is no licensing fee or royalty required to make use of TouchEngine within your software package", but the feature is enabled by "installing a paid TouchDesigner or TouchPlayer license on the machine" (Educational, Commercial or Pro) — [Derivative, TouchEngine](https://derivative.ca/UserGuide/TouchEngine)

### Inferences
- Because TouchEngine is a native Windows/macOS SDK that loads `.tox` files and requires a licensed local install, it is categorically not a web delivery path. It is the mechanism by which Unreal/Resolume/Hippotizer embed TouchDesigner, not browsers.
- The absence of any WASM/web target in the official export documentation, combined with the only "web player" discussion being an unanswered community wish-list thread, is strong evidence this does not exist rather than merely being undocumented.

### Gaps
- I found no Derivative statement that *explicitly* says "there is no web export." The conclusion rests on absence from the official export documentation plus the unanswered forum thread. If the report needs a positive denial, there isn't one to quote.
- I did not read Derivative's full release notes/changelog page directly; the conclusion is drawn from the User Guide pages for the export and streaming operators, which are the pages that would name such a feature.

---

## Q2. What export and output options does TouchDesigner actually have?

### Takeaway
TouchDesigner exports video files (H.264, HEVC, HAP, ProRes, VP8/VP9, GIF), image sequences (TIFF/EXR/PNG/JPEG/BMP/DDS), and streams live via WebSocket/HTTP/WebRTC/NDI. Everything live requires the TouchDesigner machine to be running — a hard disqualifier for a static Netlify site. The one web-compatible *artefact* is a rendered file.

### Cited Findings

**Movie / image export**
- Movie File Out TOP writes `.mov`/`.mp4` with codecs including H.264, H.265/HEVC, Hap (several sub-types), Apple ProRes, and VP8/VP9. Containers offered: automatic, `mov`, `mp4`, `mkv`, `webm`. Also animated GIF — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)
- "Certain codecs require certain containers, and some containers don't support all codecs." — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)
- Image sequence export: set Type to Image Sequence to record `.tif` or `.exr` sequences; single-image and sequence formats available are TIFF, JPEG, BMP, OpenEXR, PNG, DDS — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)
- **Licence gate on the most web-friendly codec:** "Encoding movies in H.264/H.265/AV1 codec is only available with a Commercial or Pro license." NVIDIA hardware is also required on Windows; H.264 is supported on macOS — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)

**Web Server DAT / WebSocket DAT**
- Web Server DAT "allows you to connect to TouchDesigner as a web client, through a web browser for example." It "supports HTTP, WebSockets, as well as the sending/receiving of binary data." "How client requests are handled is left up to the user via callbacks" — the `onHTTPRequest` callback receives request headers and must return a response with status, reason and optional headers — [Derivative, Web Server DAT](https://derivative.ca/UserGuide/Web_Server_DAT)
- The server is controlled by the DAT's Active parameter and runs through Python callbacks inside TouchDesigner — [Derivative, Web Server DAT](https://derivative.ca/UserGuide/Web_Server_DAT)
- Derivative's own blog/tag material covers sending data from TouchDesigner to a browser over WebSockets; a community `.tox`, WebWelder, provides two-way browser↔TouchDesigner messaging over WebSocket — [Derivative, websocket tag](https://derivative.ca/tags/websocket)

**WebRTC**
- WebRTC "provides a mechanism to stream video/audio/data from TouchDesigner to web browsers." TouchDesigner acts as one peer; the WebRTC DAT handles connections and Video Stream In/Out TOPs plus Audio Stream In/Out CHOPs carry media — [Derivative, WebRTC](https://derivative.ca/UserGuide/WebRTC)
- "A WebRTC connection cannot be established without a signaling server." Where NAT traversal fails with STUN candidates "the connection will fail. In these cases a TURN server will be required." — [Derivative, WebRTC](https://derivative.ca/UserGuide/WebRTC)
- "TouchDesigner 2022.21000+ includes" the `signalingServer`, `signalingClient` and `webRTC` palette components — [Derivative, WebRTC](https://derivative.ca/UserGuide/WebRTC)

**Licence-tier streaming features**
- Video Stream Out TOP (RTSP/RTMP/SRT) appears to be available in Non-Commercial, while "realtime H.264/H.265 movie export" and "web video streaming" are listed as paid-tier features — [Derivative, Licensing](https://derivative.ca/UserGuide/Licensing); [Derivative, Download/licence tiers](https://derivative.ca/download). *Note: the licence comparison table flattens badly when fetched as text; treat the per-tier streaming rows as needing visual confirmation.*

**NDI / Spout**
- Not read directly this session; see Gaps.

### Inferences
- **Say this plainly in the report:** Web Server DAT, WebSocket DAT, WebRTC DAT, Video Stream Out TOP and NDI/Spout are all *live* mechanisms. Each requires a TouchDesigner (or TouchPlayer) process running on a reachable machine for the duration that any visitor is on the page. On a static Netlify site with no server process, all of them are disqualified. WebRTC additionally requires a signaling server and, behind most NATs, a TURN relay — i.e. two more server processes.
- WebRTC is also economically disqualifying at scale: it is a per-viewer peer connection from one GPU machine, so it does not fan out to arbitrary website traffic.
- **The free tier cannot export the web's default codec.** Because H.264/H.265/AV1 encoding is Commercial/Pro-only, a Non-Commercial user's realistic web-video route is **VP8/VP9 in a WebM container** (unrestricted per the same page), or an image sequence encoded to H.264 afterwards with an external tool such as ffmpeg.

### Gaps
- I did not fetch the NDI TOP / Spout / Syphon pages. Both are local-machine inter-application video transports (NDI over LAN), so neither is a web delivery path, but I have no quoted citation for that this session.
- Exact per-tier rows of Derivative's licence feature matrix could not be read reliably as text; the "web video streaming" row's tier availability should be visually re-checked.
- No official file-size or bitrate guidance from Derivative for web-destined exports.

---

## Q3. TouchDesigner licensing tiers and the free Non-Commercial limits

### Takeaway
Non-Commercial is free, capped at **1280x1280** output, cannot encode H.264/H.265/AV1, and is "for non-paying/non-commercial use only." A musician's personal site is the grey area: Derivative's wording keys on *compensation*, not on publication, and does not address publishing output on a website at all.

### Cited Findings
- **Non-Commercial (Free):** "Resolution limited to 1280x1280." "For personal use or learning. Not for paying projects." "All accounts start with 10 Non-Commercial keys." — [Derivative, Download](https://derivative.ca/download)
- **Educational:** from **$300 USD**. Max GPU resolution. Adds realtime H.264/H.265 movie export, web video streaming, TouchEngine in other apps, Leuze LIDAR, Shared Memory and DirectX operators, HD Notch Block playback x2. "Not for paying projects." Forum support only — [Derivative, Download](https://derivative.ca/download)
- **Commercial:** from **$600 USD**. Same feature set as Educational. "Fully featured and for use in paying projects"; "Can use in paying projects." Forum support only — [Derivative, Download](https://derivative.ca/download)
- **Pro:** from **$2200 USD**. Everything in Commercial plus multi-process/multi-machine sync, hardware frame-lock, Stype camera tracking, BlackTrax and WrnchAI tracking, Vioso and Scalable Display, Notch Block playback, IP-protection/privacy features. Includes Pro Support (6 hours) — [Derivative, Download](https://derivative.ca/download)
- Licence definition: Non-Commercial licences are for "personal, educational or evaluation purposes for non-paying/non-commercial use only." "You may not use TouchDesigner Non-Commercial for any paid work with TouchDesigner." — [Derivative, Licensing](https://derivative.ca/UserGuide/Licensing)
- Commercial test is compensation-based: "If you or your organization are compensated for your work with TouchDesigner, you must have a Commercial or Pro license." — [Derivative, Licensing](https://derivative.ca/UserGuide/Licensing)
- Non-Commercial resolution listed as "1280x1280 limited"; Notch TOP limited to "2x Notch Blocks (1920x1080)" — [Derivative, Licensing](https://derivative.ca/UserGuide/Licensing)
- Engine COMP (running `.tox` components *inside* TouchDesigner) "works with any license including Non-Commercial licenses" — but TouchEngine in *other* applications requires a paid licence — [Derivative, TouchEngine](https://derivative.ca/UserGuide/TouchEngine)

### Inferences
- The 1280x1280 cap is squarer than any practical web video aspect ratio. A 16:9 render on the free tier tops out around **1280x720**; a vertical/portrait loop around **720x1280**. For a full-bleed hero background on a modern display that is soft, but for a letterboxed or small-panel visual it is adequate — and it is an upscale-and-blur situation, which suits abstract/particle looks more than anything with hard edges or legible type.
- A personal musician's website that *sells* music or tickets is arguably "compensated work" under Derivative's compensation test. The honest answer for the report: Derivative's published wording does not resolve this, and the only safe reading is that a free, non-monetised personal/portfolio site is within the spirit of the licence while a site that is part of a commercial release campaign is not. This is a question for Derivative's support, not something to assert.

### Gaps
- **Derivative's licence pages never address publishing or distributing Non-Commercial output on a website.** There is no quotable sentence that permits or forbids it. I could not find a Terms-of-Use clause covering distribution of rendered output.
- The licence prices are listed as "from $X USD", implying per-seat/volume variation I did not resolve.

---

## Q4. Realistic web delivery of a TouchDesigner look

### Takeaway
The only workable static-site path is **pre-rendered media**: a short seamless video loop (WebM/VP9 plus an MP4/H.264 fallback), or an image sequence / sprite sheet for short, small animations. The cost is honest and unavoidable: a pre-rendered loop is **not audio-reactive**, it is a texture.

### Cited Findings
- TouchDesigner can render directly to **WebM with VP8/VP9**, which is the codec pairing not gated behind a paid licence — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)
- H.264/H.265 export from TouchDesigner requires Commercial or Pro — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)
- Image sequences export as `.tif` or `.exr` (and single frames as TIFF/JPEG/BMP/OpenEXR/PNG/DDS), which is the route to a sprite sheet — [Derivative, Movie File Out TOP](https://derivative.ca/UserGuide/Movie_File_Out_TOP)

**Autoplay constraints the delivery must satisfy**
- "Autoplay blocking is *not* applied to `<video>` elements when the source media does not have an audio track, or if the audio track is muted. Media with an active audio track are considered to be **audible**, and autoplay blocking applies to them. **Inaudible** media are not affected by autoplay blocking." — [MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- "As a general rule, you can assume that media will be allowed to autoplay only if *at least one* of the following is true": the audio is muted or volume is 0; the user has interacted with the site; the site is allowlisted; or the autoplay Permissions Policy grants autoplay to an iframe. "Otherwise, the playback will likely be blocked." — [MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- "playback of any media that includes audio is generally blocked if the playback is programmatically initiated in a tab which has not yet had any user interaction." — [MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- MDN's canonical autoplay-safe markup, with the note that "the `playsinline` attribute ... is required for autoplay in Safari": `<video src="/videos/awesomevid.webm" controls autoplay playsinline muted></video>` — [MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- Failure detection: a rejected `play()` promise with `error.name === "NotAllowedError"` means autoplay was denied, and MDN recommends showing a play button in that case. `Navigator.getAutoplayPolicy()` reports `"allowed"`, `"allowed-muted"` or `"disallowed"` — [MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

### Inferences
- **The autoplay rules are actually permissive for this use case.** A background visual loop has no audio track at all, so it is "inaudible" media and autoplay blocking does not apply. The required markup is `autoplay muted loop playsinline` plus a silent/track-free file. This is the one part of the plan with no friction.
- **Codec strategy:** ship WebM/VP9 (which TouchDesigner can write natively on any tier) as the primary source and an MP4/H.264 as a second `<source>` for Safari/older-device safety. H.264 in MP4 is the universal baseline; HEVC is not worth shipping for a background loop (patent/decoder fragmentation, and no quality benefit that survives a muted, blurred, blend-moded background).
- **Seamless looping** is a render-time problem, not a web problem: the TouchDesigner network must be built so frame *N* equals frame *0*, e.g. by driving all animation from a phase value that completes an integer number of cycles over the loop length, rather than from absolute time or from a noise field with no period. Crossfading the tail into the head in post is the fallback when the network cannot be made periodic. I found no Derivative documentation on seamless-loop authoring.
- **File size** is the real constraint and the one to state in the report with numbers the team can verify themselves rather than numbers I invent. Levers: short duration (6–12 s), modest resolution (the 1280 cap helps here), aggressive VP9 CRF, and the fact that abstract/smoke/particle content compresses *badly* while flat-gradient content compresses well.
- **Sprite sheets / image sequences** are only competitive for very short, small, few-frame animations (a logo flourish, a cursor effect). For a multi-second full-bleed loop they are far larger than video and cost a large decode/memory budget.

### Gaps
- **I found no verified real-world examples of musicians, labels or studios shipping TouchDesigner-made visuals as web video.** My searches on this returned nothing citable. This is a genuine hole: the technique is obviously widespread (TouchDesigner is the dominant tool for music-video and live-visual work, and that output routinely ends up as web video), but I could not source a specific named site, Are.na channel or Awwwards entry this session and will not fabricate one. The report should either omit named examples or commission a dedicated pass on this.
- No vendor or MDN guidance on target file sizes for background loops; any figure in the report should be presented as a budget to test, not a cited fact.
- No citation found for seamless-loop authoring technique in TouchDesigner specifically.

---

## Q5. Can a pre-rendered loop be made to *appear* reactive?

### Takeaway
Yes, and this is the pragmatically right answer for a static site: keep the TouchDesigner render as a non-reactive texture, then modulate it in CSS/JS from a Web Audio `AnalyserNode`. The reactivity is real (it responds to the actual audio) even though the pixels are pre-baked.

### Cited Findings
- `playbackRate` on `<video>`/`<audio>` sets speed as a multiplier and changes speed without changing pitch — [MDN, Audio and video manipulation](https://developer.mozilla.org/en-US/docs/Web/Media/Audio_and_video_manipulation)
- **Range limit:** most browsers mute audio when the rate falls outside roughly **0.5 to 4**, and MDN recommends staying within that range — [MDN, playbackRate explained](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/WebAudio_playbackRate_explained)
- Analyser setup: create with `createAnalyser()`; `fftSize` defaults to 2048 — [MDN, Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- To feed a media element's audio into the graph, use a `MediaElementAudioSourceNode` — [MDN, Audio and video manipulation](https://developer.mozilla.org/en-US/docs/Web/Media/Audio_and_video_manipulation)
- **Known pitfall, dated:** a Firefox 44-era bug report describes video playback slowing to ~1x and becoming choppy once an analyser was attached to a video running at a higher `playbackRate`; the same report says Chrome behaved as expected — [Mozilla Bugzilla 1251640](https://bugzilla.mozilla.org/show_bug.cgi?id=1251640). A GameDev forum post reports the same symptom: adjusting `playbackRate` stopped working once an analyser was added, working in Chrome but not Firefox — [GameDev.net](https://ehe.gamedev.net/forums/topic/709747-web-audio-api-playbackrate)

### Inferences
- **Technique, in order of robustness:**
  1. **CSS modulation of a muted loop** (safest). Drive `opacity`, `filter: brightness()/contrast()/saturate()/blur()/hue-rotate()`, `transform: scale()`, and `mix-blend-mode` layer strength from analyser bands. No decode-pipeline risk; runs entirely on the compositor if you stick to `opacity`/`transform`.
  2. **Crossfading between several loops** — stack 2–4 videos, drive each one's `opacity` from a different frequency band or from an energy/onset measure. This produces genuinely different-looking states rather than one loop being wobbled, and is the single highest-payoff trick here.
  3. **Blend-mode compositing** — `screen`/`overlay`/`difference` between a loop and a canvas-drawn analyser layer (bars, radial spectrum, waveform). The canvas layer is truly reactive and the video supplies the TouchDesigner texture; this is the hybrid that reads as "real".
  4. **`playbackRate`** (use sparingly). Keep within 0.5–4 per MDN, and expect it to read as speed-wobble rather than as reactivity. The Firefox analyser+playbackRate interaction reports are old and may be fixed, but the combination deserves per-browser testing.
- Important detail: the analyser must read the *music* element, not the silent video. The video stays `muted` (so autoplay works); a separate `<audio>` element, started on a user gesture, is the `MediaElementAudioSourceNode` feeding the analyser. This also neatly satisfies the autoplay rules — muted visual autoplays immediately, audible music waits for a click.
- Use smoothed/eased values (`AnalyserNode.smoothingTimeConstant`, or an exponential moving average plus a slower "peak decay") rather than raw per-frame magnitudes, or the result jitters and reads as broken rather than musical.

### Gaps
- **I found no citable prior art** — no named production site documented as driving a pre-rendered loop from an AnalyserNode. MDN confirms every primitive exists but I did not find an end-to-end example, and the search explicitly returned "I didn't find a current, end-to-end example of a looping video whose playbackRate is driven by audio levels." The technique should be presented as straightforward composition of documented primitives, not as an established named pattern.
- Current (2026) Firefox behaviour for analyser + non-1.0 `playbackRate` is unverified; the only reports found are from Firefox 44.

---

## Q6. RNBO — what it is, what web export produces, and whether it runs on a static site

### Takeaway
RNBO's Web Export compiles a Max/RNBO patch to **WebAssembly** via Cycling '74's **remote cloud compiler**, producing a single `.json` file that the `@rnbo/js` library loads as a Web Audio **AudioWorkletNode**. It runs on a purely static host (Netlify/GitHub Pages) with the library pulled from a CDN — **no build step required** — but it must be served over HTTP, not opened as a local file.

### Cited Findings
- Web Export "utilizes a remote cloud compiler to compile your RNBO patch to the Web Assembly (WASM) format." — [RNBO docs, The Web Export Target](https://rnbo.cycling74.com/learn/the-web-export-target)
- Each exported device becomes an **Audio Worklet Node** (a Web Audio API component); older browsers fall back to `ScriptProcessorNode` — [RNBO docs, The Web Export Target](https://rnbo.cycling74.com/learn/the-web-export-target)
- The export is **a single `.json` file** which "contains everything you need to run your patch in the browser." — [RNBO docs, The Web Export Target](https://rnbo.cycling74.com/learn/the-web-export-target)
- `@rnbo/js` is the library that wraps the exported JSON's patch logic into a web audio node; your page's code "must include the `@rnbo/js` library." How library and JSON are integrated "is up to you." — [RNBO docs, The Web Export Target](https://rnbo.cycling74.com/learn/the-web-export-target)
- The official template **loads the RNBO library from a CDN**, while the docs also recommend the npm package — [RNBO docs, The Web Export Target](https://rnbo.cycling74.com/learn/the-web-export-target)
- Static hosting is explicitly supported: "static hosting is also an option by using something like GitHub Pages", and the docs name **Netlify** and Digital Ocean among popular options — [RNBO docs, Using the Web Page Template](https://rnbo.cycling74.com/learn/using-the-web-page-template)
- **Must be served, not opened:** "if you just double-click a .html file to open it in the browser, your RNBO device will fail to load" — a web server is needed — [RNBO docs, Using the Web Page Template](https://rnbo.cycling74.com/learn/using-the-web-page-template)
- Official example repo is `Cycling74/rnbo.example.webpage`; its example expects the patch file at `export/patch.export.json` — [RNBO docs, JavaScript Webpage Template](https://rnbo.cycling74.com/explore/javascript-webpage-template)
- Cycling '74 staff have cautioned that web export "is not designed as a 'one-click' solution for producing a hosted site" — [Cycling '74 forum, Building a website to host RNBO patches](https://cycling74.com/forums/building-a-website-to-host-rnbo-patches)
- A plain static file server suffices; forum replies cite GitHub Pages and AWS S3, and `python3 -m http.server` for local testing — [Cycling '74 forum, RNBO Web Export](https://cycling74.com/forums/rnbo-web-export)

### Inferences
- **This is a direct fit for the stated constraint.** A vanilla static Netlify site can ship RNBO: drop `patch.export.json` in the repo, add a `<script>` tag pointing at `@rnbo/js` on a CDN (unpkg/jsDelivr), and call `createDevice()` on a user gesture. No npm, no bundler, no server process. The cloud compiler is only involved at *export* time in Max, never at runtime, so there is no runtime dependency on Cycling '74 infrastructure beyond whatever CDN serves the library.
- Because the device is an `AudioWorkletNode`, it sits in the same Web Audio graph as an `AnalyserNode` — so RNBO can be the audio *source* that a visualizer reads, which is exactly the hybrid that makes a pre-rendered TouchDesigner loop look alive.
- The "must be served over HTTP" note is a dev-time gotcha only; Netlify serves over HTTPS, and AudioWorklet requires a secure context anyway.
- Pinning an exact `@rnbo/js` version in the CDN URL matters here: the exported JSON is produced by a specific RNBO version, and a floating `@latest` tag could drift away from it.

### Gaps
- I did not verify the current `@rnbo/js` version on npm or confirm the exact CDN URL form this session.
- Whether `@rnbo/js` is distributed as a UMD/IIFE global (usable from a bare `<script>` tag) or ESM-only (needing `<script type="module">` and an import URL) is not confirmed from the docs I read. This is the one thing to check before promising "no build step" — though either form works without a bundler.

---

## Q7. RNBO licensing and cost

### Takeaway
RNBO is **not** included with Max — it is a separate purchase that **requires a Max 8 or Max 9 licence**. Observed on Cycling '74's shop page 2026-11-27: **$299 permanent**, **$100/year**, **$10/month**. Web export is not priced separately; it is one of the targets the RNBO licence unlocks.

### Cited Findings
- Cycling '74's RNBO shop page lists exactly three options: **Permanent License $299.00**, **Annual Subscription $100.00/year**, **Monthly Subscription $10.00/month** — [Cycling '74 shop, RNBO](https://cycling74.com/shop/rnbo) *(observed 2026-11-27)*
- "RNBO requires a Max 8 or Max 9 license." The page notes that if you need a Max licence you can buy Max with RNBO added — [Cycling '74 shop, RNBO](https://cycling74.com/shop/rnbo)
- The product page describes a trial: "RNBO will run in a trial mode -- where saving is disabled -- allowing you to explore its capabilities" — [Cycling '74, Introducing RNBO](https://cycling74.com/products/rnbo)
- Export targets listed on the product page: Web Export (Web Audio) for "embedding a sound engine in a website"; VST3/AudioUnit plugins; Raspberry Pi export for guitar pedals, Eurorack modules and other devices; self-contained Max objects; Max for Live devices; C++ source code; and an experimental alpha for Ableton Move — [Cycling '74, Introducing RNBO](https://cycling74.com/products/rnbo)
- Cycling '74's Ableton-customer shop page states that adding RNBO "unlocks patching for export to the web, hardware, or VST/AU targets" — [Cycling '74 shop, Ableton Customers](https://cycling74.com/shop/ableton-customers)
- Cycling '74 support confirms they offer permanent licences, annual subscriptions and monthly subscriptions for RNBO, plus student discounts — [Cycling '74 support, Purchasing RNBO](https://support.cycling74.com/hc/en-us/articles/10542305345043-Purchasing-RNBO) *(page returned HTTP 403 to automated fetch; content via search index — treat as secondary)*
- Education/reseller pricing (secondary sources, not verified against Cycling '74's own current page): Sweetwater lists a student licence at **$179** and a 1–9 seat educational licence at **$299** per seat — [Sweetwater, RNBOEDU](https://www.sweetwater.com/store/detail/RNBOEDU/contact); IRCAM's partner shop lists Tier 1 (1–9 seats) **€241 excl. VAT** and Tier 2 (10–49 seats) **€225 excl. VAT** — [IRCAM Forum shop, RNBO](https://forum.ircam.fr/shop/en/partner/rnbo)
- Launch-era coverage reported the same headline figures ($10/month or $100/year, or $299 perpetual), which matches what the shop shows today — [CDM, RNBO: Max for web, hardware, plugins](https://cdm.link/rnbo-max-for-web-hardware-plugin/)

### Inferences
- **Correct a common misconception for the report:** RNBO 1.0 was announced as "bundled with Max 8.5", and the RNBO product page's "purchase Max + RNBO" phrasing reads as though RNBO ships with Max. The shop page is unambiguous that it does not — RNBO is an add-on *on top of* a Max licence. The cheapest honest entry price is therefore **Max licence + $10/month**, not $10/month.
- The $10/month tier makes this cheap to *try* but it is a subscription on top of Max; for a one-off artist site, the $299 perpetual is the figure that actually matters if the patch will be maintained over years.
- Since launch-era pricing matches current shop pricing, RNBO's price has been stable; the thing that *has* changed in public perception is the bundling-with-Max story.

### Gaps
- **I found no licence clause addressing restrictions on publishing or distributing exported web code.** The URL `docs.cycling74.com/legacy/max8/vignettes/rnbo_licensing` returned HTTP 404, and `support.cycling74.com` returned HTTP 403 to automated fetch. I cannot confirm or deny restrictions on shipping RNBO-exported WASM/JSON on a public site. Given the product is explicitly marketed for "embedding a sound engine in a website", publication is plainly the intended use — but **the report should not assert there are no restrictions**, because I could not read the EULA. This needs a human to open Cycling '74's EULA or ask support.
- Current official student/educational prices unverified against Cycling '74's own page (the figures above are from resellers).

---

## Q8. Does RNBO produce any visuals?

### Takeaway
**No.** RNBO is an audio-only export. It gives you a synth or effect in the browser, not a visualizer. This distinction is load-bearing for the project: RNBO solves "make sound in the browser", not "make a visual in the browser."

### Cited Findings
- Every RNBO export target named on the product page is audio or audio-adjacent: Web Export for "embedding a **sound engine** in a website", VST3/AU plugins, Raspberry Pi guitar pedals and Eurorack modules, Max objects, Max for Live devices, C++ source, Ableton Move instruments. No visual, graphics, Jitter or WebGL target is listed — [Cycling '74, Introducing RNBO](https://cycling74.com/products/rnbo)
- Web export output is an **Audio Worklet Node** — a Web Audio API audio-processing node — [RNBO docs, The Web Export Target](https://rnbo.cycling74.com/learn/the-web-export-target)
- A Cycling '74 forum user's workflow description makes the split explicit: "you can use the web export patch for the audio part of your application and then add a layer of code in your web application" — [Cycling '74 forum, Creating a synth... for web?](https://cycling74.com/forums/creating-a-synth-for-web/replies/1)
- A forum user wishing for the missing capability: "if there ever be a version of RNBO with jitter export to WebGL would be perfect!" — [Cycling '74 forum](https://cycling74.com/forums/web-embedded-max-patch-capabilities)

### Inferences
- RNBO's real value to a browser music visualizer is as the **audio source**: an RNBO `AudioWorkletNode` connects into the same Web Audio graph as an `AnalyserNode`, so the visuals (canvas/WebGL/CSS, hand-written) read the analyser while RNBO generates or processes the sound. All visual code must be written for the web from scratch — RNBO contributes nothing to it.
- If the site's audio is just a finished track being played back, RNBO contributes nothing at all and the $299/Max-licence cost buys nothing. RNBO only earns its place if the site needs *generative or interactive* audio (a playable synth, a live effect on the visitor's input, a procedural ambient bed).

### Gaps
- None material.

---

## Q9. Does anyone actually ship RNBO on a static website?

### Takeaway
Yes — there is an official Cycling '74 static-site template and at least one community project explicitly built for static deployment, plus an active forum thread of people doing it. The practice is real but the public examples I could verify are developer/demo projects rather than named artist sites.

### Cited Findings
- Cycling '74 maintains the official template repo `Cycling74/rnbo.example.webpage` — "This guide show[s] how to use this repository to add dynamic audio to a webpage using the Web Export feature in RNBO" — [RNBO docs, JavaScript Webpage Template](https://rnbo.cycling74.com/explore/javascript-webpage-template)
- `stretta/Juno2` — a community RNBO web project that "notes that any static host that can serve the repository contents will work, as long as the exported RNBO files inside `export/` are deployed alongside the app" — [GitHub, stretta/Juno2](https://github.com/stretta/Juno2)
- `maceq687/FaceArp` — a community RNBO web project — [GitHub, maceq687/FaceArp](https://github.com/maceq687/FaceArp)
- A dedicated Cycling '74 forum thread, "Building a website to host RNBO patches", documents people doing exactly this and Cycling '74 staff setting expectations — [Cycling '74 forum](https://cycling74.com/forums/building-a-website-to-host-rnbo-patches)
- A further thread, "Embedding an RNBO application into a website" — [Cycling '74 forum](https://cycling74.com/forums/embedding-an-rnbo-application-into-a-website)
- An academic/student project (Aalborg University master's thesis) using RNBO web export — [AAU project repository](https://projekter.aau.dk/projekter/files/535868106/Master_Thesis__1_.pdf)

### Inferences
- `stretta` is Brian Crabtree (monome), a well-known figure in the Max/electronic-instrument world, which makes Juno2 a credible real-world reference point rather than a toy.
- The pattern "exported files in `export/`, static host serves the repo" is the de facto deployment convention and maps onto Netlify with zero configuration.

### Gaps
- **I did not verify any named musician's or label's commercial site running RNBO.** The examples above are open-source demos, templates and academic work. I did not open the individual repos to confirm they are deployed and live. If the report wants a "real artists ship this" claim, it needs a dedicated verification pass.

---

## Q10. Max/MSP visuals (Jitter) — is there any web export?

### Takeaway
**No.** There is no web export for Jitter patches. Max's browser-related objects run a Chromium browser *inside* Max — the opposite direction. The only Max→web path is RNBO, and RNBO is audio-only.

### Cited Findings
- Max's browser objects go web→Max, not Max→web: Max "contains a web browser, implemented with the Chromium Embedded Framework (CEF). You can access this browser through the `jweb` object." `jit.web` and `jit.gl.web` send the rendered page out as a Jitter matrix or texture, with `jit.web~` variants adding audio — [Cycling '74 docs, Web Browser and jweb](https://docs.cycling74.com/userguide/web_browser/); [Cycling '74 reference, jit.web](https://docs.cycling74.com/reference/jit.web)
- RNBO's export-target list contains no Jitter, graphics or WebGL target — [Cycling '74, Introducing RNBO](https://cycling74.com/products/rnbo); [RNBO docs, Export targets overview](https://rnbo.cycling74.com/learn/export-targets-overview)
- Community request confirming the gap: "if there ever be a version of RNBO with jitter export to WebGL would be perfect!" — [Cycling '74 forum, Web embedded max patch capabilities](https://cycling74.com/forums/web-embedded-max-patch-capabilities)
- A 2020-era forum reply concluded "it's not possible to have a local/browser-loaded version of a max patch" — [Cycling '74 forum, Max MSP on Websites](https://cycling74.com/forums/max-msp-html)
- MIRA/MIRAWEB lets a browser *control* a running Max patch, but a forum user notes "there is no way to listen to the sound from MSP in a web browser and MIRAWEB only works locally I guess" — [Cycling '74 forum](https://cycling74.com/forums/is-it-possible-to-control-max-and-receive-msp-signal-with-an-html-web-environment)
- Suggested workaround from the same discussions: a separate web interface sending OSC or similar to control a Max patch remotely — [Cycling '74 forum](https://cycling74.com/forums/is-it-possible-to-control-max-and-receive-msp-signal-with-an-html-web-environment)

### Inferences
- Jitter and TouchDesigner land in exactly the same place: both are GPU-graphics environments with no browser runtime, whose only web story is live streaming from a running desktop process or pre-rendered media.
- MIRAWEB is a remote-control surface for a locally running Max patch — a server process on the artist's machine. Under the stated constraint it is disqualified for the same reason as TouchDesigner's Web Server DAT.

### Gaps
- The "not possible" statement is a 2020 community opinion, not an official Cycling '74 denial. However the official RNBO export-target documentation lists no graphics target, which is the stronger evidence.

---

## Q11. Max for Live, gen~, and Node for Max — any web story?

### Takeaway
Max for Live has no web story (it targets Ableton Live, a desktop DAW). `gen~` *does* reach the web, but only indirectly: RNBO can contain `gen~` and compiles the whole patch to WASM. **Node for Max runs a Node.js process locally on the artist's machine alongside Max — it is not a browser runtime and is irrelevant to web delivery.**

### Cited Findings

**Max for Live / gen~**
- RNBO's targets include "improving performance and loading times of Max for Live devices" — i.e. RNBO exports *into* Max for Live, not out of it to the web — [Cycling '74, Introducing RNBO](https://cycling74.com/products/rnbo)
- RNBO can also generate "C++ source code ... for use in other projects", alongside the Web Export target — [Cycling '74, Introducing RNBO](https://cycling74.com/products/rnbo)

**Node for Max — confirmed local, as expected**
- `node.script` "controls a local Node.js process from Max", and "unlike `js`, `node.script` runs in a separate process" — [Cycling '74 docs, node.script](https://docs.cycling74.com/reference/node.script)
- Node.js is bundled: "Node.js is built into Max itself, so there are no hassles finding and downloading a separate runtime" — [Sound On Sound, Max review](https://www.soundonsound.com/node/4920674?page=2)
- Communication is via a Max-specific module: "To communicate with Max, the Node script uses the `max-api` Node module", automatically included — [Cycling '74 docs, Node for Max](https://docs.cycling74.com/max8/vignettes/00_N4M_index)
- Intended use is "a separate service that can use the full Node.js API, such as HTTP requests or file system access" — [Cycling '74 docs, Node for Max](https://docs.cycling74.com/max8/vignettes/00_N4M_index)
- It has no graphics access: "there's no access to Max's internal API for patcher scripting or graphics" — [Sound On Sound, Max review](https://www.soundonsound.com/node/4920674?page=2)

### Inferences
- **Confirmed as expected: Node for Max is a local server-side helper, not a web delivery mechanism.** It could run an HTTP server on the artist's machine serving a page that talks to Max — which is precisely the "requires a server process running on the artist's machine" pattern that the project's constraints disqualify. Worth stating explicitly because the name invites the wrong conclusion.
- `gen~` is the one piece of Max's DSP stack with a genuine web path, since RNBO compiles `gen~`-containing patches to WASM. But that path is RNBO's, and inherits RNBO's audio-only limitation.
- Max for Live is structurally irrelevant: its host is Ableton Live.

### Gaps
- I did not verify from primary documentation that `gen~` objects are fully supported inside RNBO web exports (as opposed to RNBO's other targets). This should be checked against RNBO's object-support list if the report makes a claim about it.

---

## Summary table for the report writer

| Path | Runs on static Netlify site? | Produces visuals? | Verdict |
|---|---|---|---|
| TouchDesigner browser runtime / WASM / web player | **Does not exist** | — | Ruled out |
| TouchEngine | No — native Win/macOS SDK, needs licensed local install | Yes (natively) | Ruled out for web |
| TD Web Server DAT / WebSocket DAT | No — needs TouchDesigner process running | Data only | Disqualified by constraint |
| TD WebRTC | No — needs TouchDesigner + signaling server + likely TURN | Yes (streamed) | Disqualified by constraint |
| TD NDI / Spout | No — local/LAN transports | Yes | Not a web path |
| **TD pre-rendered video loop (WebM/VP9 + MP4 fallback)** | **Yes** | Yes, but **not reactive** | **The workable TouchDesigner path** |
| TD image sequence / sprite sheet | Yes | Yes, short/small only | Niche |
| **Pre-rendered loop + AnalyserNode-driven CSS / crossfade / blend** | **Yes** | **Reads as reactive** | **Best-value TouchDesigner path** |
| **RNBO Web Export (WASM + AudioWorklet, `@rnbo/js` from CDN)** | **Yes, no build step** | **No — audio only** | **Works, but solves audio not visuals** |
| Jitter web export | **Does not exist** | — | Ruled out |
| MIRA / MIRAWEB | No — remote-controls a local Max patch | GUI only | Disqualified by constraint |
| Node for Max | No — local Node process beside Max | No (no graphics API) | Not a web path |
| Max for Live | No — targets Ableton Live | — | Irrelevant |
