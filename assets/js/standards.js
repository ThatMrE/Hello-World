/*
 * ANALOG FIDELITY INDEX (AFI) v1.0
 * ---------------------------------
 * An open, transparent scoring model for terrestrial analog astronaut missions.
 *
 * The model is inspired by the direction of travel in the analog community —
 * analogstandards.space, the IGSA-STD-1 standard released in 2023 by an
 * international group of analog mission managers, and the Extended Feature
 * Classification System of Analogues (EFCSA) published in Frontiers in Space
 * Technologies — but it is an independent, explicitly documented rubric.
 * It is NOT an official IGSA or analogstandards.space score.
 *
 * Every criterion is scored 0-5 against published anchors. The composite
 * Analog Fidelity Index is a weighted mean expressed 0-100. Weights are
 * user-adjustable in the UI so anyone can re-rank the world's habitats
 * against the fidelity dimensions that matter to their own research.
 */

window.AFI = (function () {
  'use strict';

  var CRITERIA = [
    {
      key: 'isolation',
      code: 'ISO',
      name: 'Isolation & Confinement',
      weight: 0.15,
      short: 'How completely is the crew cut off from ordinary life?',
      detail:
        'Physical separation from the outside world: absence of windows and ' +
        'unscripted human contact, distance from rescue, restricted volume per ' +
        'crew member, and the psychological reality of not being able to walk ' +
        'out. This is the single most transferable stressor between Earth and ' +
        'spaceflight, and the core of every ICE (Isolated, Confined, Extreme) ' +
        'environment study.',
      anchors: [
        '0 — Day visitors; crew goes home at night.',
        '1 — Residential but freely permeable; public and press walk in.',
        '2 — Site is remote or gated, but crew leaves sim regularly.',
        '3 — Continuous confinement, scheduled outside contact, rescue hours away.',
        '4 — Sealed or windowless habitat, no unscripted contact, rescue >1 day.',
        '5 — Physically unable to leave (polar winter, saturation depth, high Arctic); rescue impossible for weeks or months.'
      ]
    },
    {
      key: 'environment',
      code: 'ENV',
      name: 'Environmental & Geological Analogy',
      weight: 0.12,
      short: 'How much does the terrain outside the airlock look and behave like the target body?',
      detail:
        'Geomorphological and geochemical similarity to the Moon or Mars: ' +
        'basaltic or regolith-like substrate, impact structures, lava tubes, ' +
        'hyperarid or permafrost soils, absence of vegetation and horizon ' +
        'clutter, plus genuinely hostile ambient conditions (temperature, ' +
        'pressure, radiation, dust). A steel chamber in a car park scores low ' +
        'here no matter how good its psychology programme is.',
      anchors: [
        '0 — Indoor space with no exterior analog terrain.',
        '1 — Generic outdoor site; landscape reads as ordinary Earth.',
        '2 — Purpose-built regolith yard or sandbox adjoining a building.',
        '3 — Genuinely barren terrain (desert, quarry, ice) with limited geologic relevance.',
        '4 — Recognised planetary analog geology (basalt fields, impact ejecta, hyperarid soils) used by instrument teams.',
        '5 — Reference-grade analog terrain used to validate flight hardware: lava tubes, impact craters, Atacama-class hyperarid soil, high-Arctic permafrost.'
      ]
    },
    {
      key: 'duration',
      code: 'DUR',
      name: 'Duration & Mission Continuity',
      weight: 0.15,
      short: 'Long enough for the interesting things to break?',
      detail:
        'Group dynamics, circadian drift, the third-quarter effect, microbial ' +
        'succession and hardware wear all have characteristic timescales. Under ' +
        'roughly two weeks, an analog measures novelty and adrenaline; beyond ' +
        'two months it starts measuring what an actual transit or surface stay ' +
        'will feel like. Continuity matters as much as raw length — a mission ' +
        'that pauses each weekend is not a long mission.',
      anchors: [
        '0 — Hours to one night.',
        '1 — 2-6 days.',
        '2 — 1-2 weeks.',
        '3 — 2-6 weeks unbroken.',
        '4 — 2-6 months unbroken.',
        '5 — 6 months to >1 year unbroken (Mars-class transit or surface stay).'
      ]
    },
    {
      key: 'eva',
      code: 'EVA',
      name: 'EVA & Suit Simulation',
      weight: 0.12,
      short: 'Do excursions cost what a real spacewalk costs?',
      detail:
        'Whether egress is a genuine operational event: airlock or prebreathe ' +
        'protocol, pressurised or high-fidelity analog suit with real mass, ' +
        'restricted field of view, gloved dexterity penalty, finite consumables ' +
        'and a hard walk-back limit, buddy rules, and suited science tasks with ' +
        'a defined timeline. Neutral-buoyancy and saturation-diving analogs score ' +
        'highly here because the environment itself enforces the penalty.',
      anchors: [
        '0 — No EVA concept; crew simply walks outside.',
        '1 — Symbolic EVA: costume, no operational constraint.',
        '2 — Analog suit and airlock ritual, limited task realism.',
        '3 — Weighted analog suit, airlock protocol, timed EVA with buddy rules and science tasks.',
        '4 — High-fidelity suit simulator (mass, restricted FOV/dexterity, consumables, comms), rover or robotic partner, formal EVA plan and walk-back limit.',
        '5 — Environment physically enforces the suit: saturation diving, neutral buoyancy, or pressurised suit testing where an error has real physiological consequences.'
      ]
    },
    {
      key: 'comms',
      code: 'COM',
      name: 'Communication Latency & Autonomy',
      weight: 0.12,
      short: 'Can mission control actually save them in time?',
      detail:
        'Imposed one-way light-time delay (Moon ~1.3 s, Mars 3-22 min), ' +
        'store-and-forward messaging instead of live voice, blackout windows, ' +
        'and — most importantly — genuine delegation of decision authority to the ' +
        'crew. Autonomy is the behavioural variable that most sharply separates ' +
        'low-Earth-orbit operations from deep space, and it is the one most ' +
        'often faked.',
      anchors: [
        '0 — Live, unrestricted contact; phones and social media in use.',
        '1 — Informal contact limits, no technical delay.',
        '2 — Scheduled comms windows, no delay.',
        '3 — Lunar-class delay (seconds) or asynchronous text-only ops.',
        '4 — Mars-class delay imposed on all traffic (typically 10-20 min each way).',
        '5 — Full Mars delay plus enforced blackouts and real delegated decision authority for anomalies and medical events.'
      ]
    },
    {
      key: 'closure',
      code: 'CLO',
      name: 'Resource Closure & Life Support',
      weight: 0.11,
      short: 'Is the mass balance real, or is there a supermarket run?',
      detail:
        'The degree to which air, water, power and food are actually closed and ' +
        'metered rather than notionally rationed: pressure differential against ' +
        'ambient, CO2 scrubbing, water recycling, bioregenerative food production, ' +
        'an energy budget the crew can overdraw, and — decisively — the absence of ' +
        'resupply. This is the criterion where most otherwise excellent analogs ' +
        'score lowest.',
      anchors: [
        '0 — Mains utilities, unlimited resupply.',
        '1 — Rationed consumables by agreement, physically unlimited.',
        '2 — Hard consumable budget, no resupply during mission, open atmosphere.',
        '3 — Off-grid power/water with real scarcity; partial recycling; food production experiment.',
        '4 — Sealed or pressure-controlled atmosphere with active CO2 scrubbing and metered mass balance.',
        '5 — Hermetically sealed, materially closed bioregenerative life support with measured atmospheric and water closure over months.'
      ]
    },
    {
      key: 'ops',
      code: 'OPS',
      name: 'Operational Realism (SimOps)',
      weight: 0.13,
      short: 'Is there a real flight control team, or a group chat?',
      detail:
        'A staffed mission support centre with distinct flight-control ' +
        'disciplines, a published flight plan and timeline, formal procedures ' +
        'and checklists, anomaly and contingency injects, medical and safety ' +
        'protocols, structured debriefs, and the sim discipline to hold the ' +
        'simulation when things go wrong. Adapted from the operational-quality ' +
        'emphasis of IGSA-STD-1.',
      anchors: [
        '0 — Self-organising crew, no external support structure.',
        '1 — A point of contact on call.',
        '2 — Named mission support with a daily plan.',
        '3 — Staffed control room, written procedures, daily reporting, defined sim rules.',
        '4 — Multi-discipline flight control (FD, CAPCOM, remote science, flight surgeon), anomaly injects, formal safety case and debrief.',
        '5 — Agency-grade operations: certified procedures, medical monitoring, independent safety review, and mission rules governing sim break.'
      ]
    },
    {
      key: 'science',
      code: 'SCI',
      name: 'Scientific Rigor & Data Return',
      weight: 0.10,
      short: 'Does anything survive the mission except the photographs?',
      detail:
        'Whether the analog functions as a research platform: peer-reviewed ' +
        'output, ethics or IRB oversight for human-subject work, baseline and ' +
        'post-mission measurement, controlled and repeatable protocols, adequate ' +
        'and pooled sample sizes, standardised metadata and archived open data. ' +
        'The whole motivation for standardising analogs is that incomparable ' +
        'one-off missions cannot be pooled into conclusions.',
      anchors: [
        '0 — Outreach or tourism only.',
        '1 — Educational programme, informal data collection.',
        '2 — Student-led experiments, occasional conference abstracts.',
        '3 — Structured experiment call, documented protocols, regular conference publication.',
        '4 — Ethics-reviewed human-subject research, baseline/post measures, peer-reviewed journal output.',
        '5 — Agency-standard research: controlled design, pooled multi-mission datasets, standardised measures, archived open data.'
      ]
    }
  ];

  var TIERS = [
    { min: 85, code: 'V',   name: 'Peak Fidelity',      cls: 'tier-5', blurb: 'Approaches the operational and physiological reality of the mission it stands in for. Errors here have consequences.' },
    { min: 70, code: 'IV',  name: 'High Fidelity',      cls: 'tier-4', blurb: 'A serious research platform: real isolation, real operations, publishable human-subject science.' },
    { min: 55, code: 'III', name: 'Moderate Fidelity',  cls: 'tier-3', blurb: 'Credible simulation with real constraints, typically limited by mission length or resource closure.' },
    { min: 40, code: 'II',  name: 'Entry Fidelity',     cls: 'tier-2', blurb: 'Genuine analog structure and discipline, but short, permeable, or narrow in scope.' },
    { min: 0,  code: 'I',   name: 'Experiential',       cls: 'tier-1', blurb: 'Training, education, outreach or tourism. Valuable for the pipeline; not a substitute for mission data.' }
  ];

  /* The five defining conditions. A site must satisfy the first three to be
     called an analog astronaut mission at all; the last two separate a mission
     from a mere analog *site*. */
  var DEFINITION = [
    {
      n: 1,
      title: 'A crew, living the mission',
      body:
        'Human beings occupy the environment continuously for the duration, ' +
        'in the roles they would hold in flight — commander, flight engineer, ' +
        'health and safety officer, science officer, journalist. Robotic field ' +
        'tests and instrument deployments at analog sites are analog *research*, ' +
        'but without a resident crew they are not an analog astronaut mission.'
    },
    {
      n: 2,
      title: 'A maintained simulation',
      body:
        'The crew behaves as though it were on the Moon or Mars, and the ' +
        'constraints of that place are enforced rather than imagined: no ' +
        'unsuited egress, no unlogged consumables, no stepping out of the sim ' +
        'for convenience. The moment the simulation is broken casually, the ' +
        'data stops being about spaceflight.'
    },
    {
      n: 3,
      title: 'Real, transferable stressors',
      body:
        'Isolation, confinement, and at least one genuinely extreme ' +
        'element — cold, depth, altitude, aridity, darkness, pressure — that the ' +
        'crew cannot negotiate with. The ICE triad is what makes an analog ' +
        'predictive rather than theatrical.'
    },
    {
      n: 4,
      title: 'An operational framework',
      body:
        'A flight plan, procedures and checklists, a mission support team ' +
        'outside the habitat, defined comms protocol, and explicit mission ' +
        'rules for anomalies, medical events and sim break. This is the ' +
        'component IGSA-STD-1 was written to standardise, because it is what ' +
        'makes missions comparable to each other.'
    },
    {
      n: 5,
      title: 'A research payload',
      body:
        'A defined set of experiments with protocols, ethical oversight for ' +
        'human-subject work, baseline and post-mission measurement, and data ' +
        'that leaves the habitat in a form somebody else can use. An analog ' +
        'mission that returns only photographs has trained people, which is ' +
        'worth doing, but it has not advanced the state of knowledge.'
    }
  ];

  function score(site) {
    var total = 0, wsum = 0;
    for (var i = 0; i < CRITERIA.length; i++) {
      var c = CRITERIA[i];
      var v = site.scores && typeof site.scores[c.key] === 'number' ? site.scores[c.key] : 0;
      total += (v / 5) * c.weight;
      wsum += c.weight;
    }
    return wsum ? Math.round((total / wsum) * 1000) / 10 : 0;
  }

  function scoreWith(site, weights) {
    var total = 0, wsum = 0;
    for (var i = 0; i < CRITERIA.length; i++) {
      var c = CRITERIA[i];
      var w = weights && typeof weights[c.key] === 'number' ? weights[c.key] : c.weight;
      var v = site.scores && typeof site.scores[c.key] === 'number' ? site.scores[c.key] : 0;
      total += (v / 5) * w;
      wsum += w;
    }
    return wsum ? Math.round((total / wsum) * 1000) / 10 : 0;
  }

  function tier(afi) {
    for (var i = 0; i < TIERS.length; i++) if (afi >= TIERS[i].min) return TIERS[i];
    return TIERS[TIERS.length - 1];
  }

  return {
    CRITERIA: CRITERIA,
    TIERS: TIERS,
    DEFINITION: DEFINITION,
    score: score,
    scoreWith: scoreWith,
    tier: tier
  };
})();
