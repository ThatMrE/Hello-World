/* HALF BAD — site content.
   Everything the page renders lives here so copy edits never touch markup. */

const TOUR = [
  // ── Festivals, late summer 2026 ──
  { date: '2026-08-22', region: 'fest', city: 'Malvern Hills', country: 'UK', venue: 'Skankwell Festival', status: 'onsale', note: 'Main stage, 18:40' },
  { date: '2026-09-05', region: 'fest', city: 'Rotterdam',     country: 'NL', venue: 'Offbeat Open Air',   status: 'low',    note: 'Second on the bill' },

  // ── UK & Ireland, autumn 2026 ──
  { date: '2026-09-18', region: 'uk', city: 'Bristol',    country: 'UK', venue: 'The Marble Factory',      status: 'onsale',  note: '+ The Bad Manors' },
  { date: '2026-09-19', region: 'uk', city: 'Manchester', country: 'UK', venue: 'Gorilla',                 status: 'soldout', note: '+ The Bad Manors' },
  { date: '2026-09-20', region: 'uk', city: 'Glasgow',    country: 'UK', venue: "King Tut's Wah Wah Hut",  status: 'onsale',  note: '+ The Bad Manors' },
  { date: '2026-09-24', region: 'uk', city: 'Leeds',      country: 'UK', venue: 'Brudenell Social Club',   status: 'low',     note: '+ Pressure Drop Sound' },
  { date: '2026-09-25', region: 'uk', city: 'Dublin',     country: 'IE', venue: "Whelan's",                status: 'onsale',  note: '+ Pressure Drop Sound' },
  { date: '2026-09-26', region: 'uk', city: 'Belfast',    country: 'UK', venue: 'Limelight 2',             status: 'onsale',  note: '+ Pressure Drop Sound' },
  { date: '2026-10-02', region: 'uk', city: 'Coventry',   country: 'UK', venue: 'The Empire — Night 1',    status: 'soldout', note: 'Homecoming' },
  { date: '2026-10-03', region: 'uk', city: 'Coventry',   country: 'UK', venue: 'The Empire — Night 2',    status: 'low',     note: 'Homecoming' },
  { date: '2026-10-04', region: 'uk', city: 'London',     country: 'UK', venue: 'Electric Ballroom',       status: 'low',     note: 'Full horn section + strings' },

  // ── Europe, autumn 2026 ──
  { date: '2026-10-15', region: 'eu', city: 'Amsterdam', country: 'NL', venue: 'Melkweg (Oude Zaal)', status: 'onsale',  note: '+ Rudi & The Lot' },
  { date: '2026-10-16', region: 'eu', city: 'Ghent',     country: 'BE', venue: 'Trefpunt',            status: 'onsale',  note: 'Third time lucky' },
  { date: '2026-10-17', region: 'eu', city: 'Cologne',   country: 'DE', venue: 'Gebäude 9',           status: 'onsale',  note: '+ Rudi & The Lot' },
  { date: '2026-10-19', region: 'eu', city: 'Berlin',    country: 'DE', venue: 'Lido',                status: 'low',     note: '+ Rudi & The Lot' },
  { date: '2026-10-21', region: 'eu', city: 'Prague',    country: 'CZ', venue: 'Futurum Music Bar',   status: 'onsale',  note: '' },
  { date: '2026-10-23', region: 'eu', city: 'Milan',     country: 'IT', venue: 'Legend Club',         status: 'onsale',  note: '' },
  { date: '2026-10-24', region: 'eu', city: 'Zurich',    country: 'CH', venue: 'Dynamo',              status: 'onsale',  note: '' },
  { date: '2026-10-26', region: 'eu', city: 'Paris',     country: 'FR', venue: 'Petit Bain',          status: 'low',     note: '+ Les Rudes' },
  { date: '2026-10-27', region: 'eu', city: 'Barcelona', country: 'ES', venue: 'Sala Upload',         status: 'onsale',  note: '+ Les Rudes' },

  // ── North America, early 2027 ──
  { date: '2027-02-20', region: 'na', city: 'Brooklyn, NY',     country: 'US', venue: 'Music Hall of Williamsburg', status: 'onsale',  note: '+ Skankton Ave.' },
  { date: '2027-02-21', region: 'na', city: 'Philadelphia, PA', country: 'US', venue: 'Underground Arts',           status: 'onsale',  note: '+ Skankton Ave.' },
  { date: '2027-02-23', region: 'na', city: 'Toronto, ON',      country: 'CA', venue: "Lee's Palace",               status: 'onsale',  note: '' },
  { date: '2027-02-25', region: 'na', city: 'Chicago, IL',      country: 'US', venue: 'Bottom Lounge',              status: 'onsale',  note: '+ Skankton Ave.' },
  { date: '2027-02-27', region: 'na', city: 'Denver, CO',       country: 'US', venue: 'Bluebird Theater',           status: 'onsale',  note: '' },
  { date: '2027-03-01', region: 'na', city: 'Seattle, WA',      country: 'US', venue: 'Neumos',                     status: 'onsale',  note: '+ Puget Rudeboys' },
  { date: '2027-03-03', region: 'na', city: 'San Francisco, CA',country: 'US', venue: 'Great American Music Hall',  status: 'low',     note: '+ Puget Rudeboys' },
  { date: '2027-03-05', region: 'na', city: 'Los Angeles, CA',  country: 'US', venue: 'The Regent Theater',         status: 'soldout', note: '+ Puget Rudeboys' },
  { date: '2027-03-06', region: 'na', city: 'San Diego, CA',    country: 'US', venue: 'The Casbah',                 status: 'onsale',  note: '' },
  { date: '2027-03-08', region: 'na', city: 'Austin, TX',       country: 'US', venue: 'Mohawk (Outdoor)',           status: 'onsale',  note: '' },

  // ── Festivals, summer 2027 ──
  { date: '2027-06-26', region: 'fest', city: 'Leipzig',  country: 'DE', venue: 'Brassneck Weekender', status: 'onsale', note: 'Saturday headline' },
  { date: '2027-07-10', region: 'fest', city: 'Coventry', country: 'UK', venue: 'Porkpie Picnic',      status: 'onsale', note: 'We curate the whole thing' }
];

const MERCH = [
  {
    id: 'tee-checker', cat: 'apparel', name: 'Checkerboard Ringer Tee', price: 26,
    img: 'assets/img/m-tee-checker.svg', badge: 'Best seller',
    blurb: 'Heavyweight organic cotton, black ringer collar, two-tone chest panel.',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'tee-album', cat: 'apparel', name: '"Porkpie Paranoia" Album Tee', price: 24,
    img: 'assets/img/m-tee-album.svg', badge: 'New',
    blurb: 'Front cover print, tour routing on the back. Water-based ink, no plastic feel.',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 'jacket', cat: 'apparel', name: 'Half Bad Work Jacket', price: 68,
    img: 'assets/img/m-jacket.svg', badge: 'Ltd. 200',
    blurb: 'Chore-cut cotton twill, chain-stitched back panel, embroidered chest mark.',
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'lp-porkpie', cat: 'vinyl', name: 'Porkpie Paranoia — Mustard LP', price: 28,
    img: 'assets/img/cover-porkpie.svg', badge: 'Ltd. colour',
    blurb: '180g mustard vinyl, gatefold sleeve, lyric insert. Free 7" with every order.',
    sizes: []
  },
  {
    id: 'lp-offbeat', cat: 'vinyl', name: 'Offbeat & Overdrawn — Black LP', price: 22,
    img: 'assets/img/cover-offbeat.svg', badge: 'Repress',
    blurb: 'Third pressing, corrected mastering, printed inner sleeve.',
    sizes: []
  },
  {
    id: 'lp-skank', cat: 'vinyl', name: 'Skank Etiquette — Original Press', price: 30,
    img: 'assets/img/cover-skank.svg', badge: '', sold: true,
    blurb: 'The 2019 debut. 500 copies, all gone. We are not repressing it — sorry.',
    sizes: []
  },
  {
    id: 'pins', cat: 'bits', name: 'Enamel Pin Set (3)', price: 12,
    img: 'assets/img/m-pins.svg', badge: '',
    blurb: 'Porkpie, trombone, and the half-bad checker. Butterfly clutch backs.',
    sizes: []
  },
  {
    id: 'hat', cat: 'bits', name: 'The Porkpie Hat', price: 34,
    img: 'assets/img/m-hat.svg', badge: 'Low stock',
    blurb: 'Wool felt, flat crown, grosgrain band. Made by a hatter in Luton.',
    sizes: ['S/M', 'L/XL']
  },
  {
    id: 'tote', cat: 'bits', name: '"Doors 7, Offbeat 8" Tote', price: 14,
    img: 'assets/img/m-tote.svg', badge: '',
    blurb: 'Thick 12oz canvas, long handles, holds two LPs and a pint of regret.',
    sizes: []
  },
  {
    id: 'bundle-lp', cat: 'bundle', name: 'LP + Tee Bundle', price: 45,
    img: 'assets/img/m-bundle.svg', badge: 'Save £9',
    blurb: 'Mustard LP plus the album tee, in your size. The obvious one.',
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'bundle-kit', cat: 'bundle', name: 'Tour Survival Kit', price: 58,
    img: 'assets/img/m-bundle-kit.svg', badge: 'Ltd.',
    blurb: 'Checker tee, pin set, tote, signed setlist from a show on this run.',
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  }
];

const DISCOG = [
  {
    id: 'porkpie', title: 'Porkpie Paranoia', year: 2026, kind: 'Album',
    cover: 'assets/img/cover-porkpie.svg', accent: '#ffc629',
    blurb: 'Recorded live to tape in four days at Foleshill Road, then argued about for eleven months. Horns up front, nerves showing.',
    formats: ['LP', 'CD', 'Digital', 'Cassette'],
    tracks: ['Porkpie Paranoia', 'Council Tax Rocksteady', 'Two Tone Two Faced', 'Offbeat Anxiety', 'The Long Way Round the Ring Road',
             'Trombone Kid', 'Nothing Doing (Skank)', 'Late Bus Lament', 'Rudeness Is a Discipline', 'Ninety Nine Excuses',
             'The Empire, Two Nights', 'Half Bad, All In']
  },
  {
    id: 'locarno', title: 'Live at the Locarno', year: 2024, kind: 'Live Album',
    cover: 'assets/img/cover-locarno.svg', accent: '#c8352b',
    blurb: 'Two desk mixes from the 2024 homecoming, warts and curfew violation included. Track 10 is the fire alarm.',
    formats: ['2xLP', 'Digital'],
    tracks: ['Intro (Ring Road)', 'Skank Etiquette', 'Bad Habit Boogie', 'Overdrawn', 'Ghent Again',
             'Brass Neck', 'Instrumental for the Bar Staff', 'Doors Seven', 'Half Bad', 'Curfew']
  },
  {
    id: 'rudeness', title: 'The Rudeness EP', year: 2022, kind: 'EP',
    cover: 'assets/img/cover-rudeness.svg', accent: '#1e7a5e',
    blurb: 'Five songs cut between tours on borrowed studio time. The one where the organ took over.',
    formats: ['10"', 'Digital'],
    tracks: ['Rudeness', 'Hammond Trouble', 'Sunday Best', 'A Word With You Outside', 'Rudeness (Dub)']
  },
  {
    id: 'offbeat', title: 'Offbeat & Overdrawn', year: 2021, kind: 'Album',
    cover: 'assets/img/cover-offbeat.svg', accent: '#2f6fd0',
    blurb: 'Written skint, recorded skinter. Still the one people shout for, and we still play all of it.',
    formats: ['LP', 'CD', 'Digital'],
    tracks: ['Overdrawn', 'Brass Neck', 'The Landlord Waltz', 'Ghent Again', 'Small Hours, Large Debts',
             'Skank the Interest', 'Cheque Bounce Rocksteady', 'Nine to Nowhere', 'Van Trouble', 'Weekend Money', 'Overdrawn (Reprise)']
  },
  {
    id: 'skank', title: 'Skank Etiquette', year: 2019, kind: 'Album',
    cover: 'assets/img/cover-skank.svg', accent: '#f4f1e8',
    blurb: 'The debut. Recorded in a pub back room for £400 and a curry. Original vinyl is long gone.',
    formats: ['LP (OOP)', 'CD', 'Digital'],
    tracks: ['Skank Etiquette', 'Bad Habit Boogie', 'Porkpie', 'First Offbeat', 'The Pub That Became a Letting Agency',
             'Trouble at the Bus Stop', 'Half Bad', 'Coventry Sound System', 'Two of Everything', 'Last Orders']
  }
];
