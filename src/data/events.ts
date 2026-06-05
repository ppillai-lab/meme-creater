export interface PoliticalEvent {
  id: string
  title: string
  summary: string
  characters: string[]
  tags: string[]
  date: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export const currentEvents: PoliticalEvent[] = [
  // ── CENTRAL / BJP / MODI ────────────────────────────────────
  {
    id: 'electoral-bonds',
    title: 'Electoral Bonds Scam',
    summary: 'Companies donated ₹1,698 crore to BJP AFTER being raided by ED/CBI. Supreme Court struck down electoral bonds as unconstitutional on Feb 15, 2024. The biggest legalized corruption scheme in Indian history.',
    characters: ['modi'],
    tags: ['corruption', 'BJP', 'money', 'Supreme Court'],
    date: '2024',
    severity: 'critical',
  },
  {
    id: 'adani-scandal',
    title: 'Adani-Modi Nexus',
    summary: 'Hindenburg Research exposed Adani Group for stock manipulation and accounting fraud in Jan 2023. Adani lost $150B in value. Modi government did nothing. OCCRP further exposed alleged Adani offshore operations.',
    characters: ['modi'],
    tags: ['Adani', 'corruption', 'crony capitalism', 'stock fraud'],
    date: '2023-2024',
    severity: 'critical',
  },
  {
    id: 'detention-bill',
    title: 'Detention Amendment Bill 2025',
    summary: 'Modi government\'s bill to automatically strip elected leaders of their post if arrested for 30+ days. Opposition calls it weaponization of law against political enemies. 115 of 121 ED-targeted leaders were from opposition.',
    characters: ['modi'],
    tags: ['democracy', 'opposition', 'ED', 'CBI', 'bill'],
    date: '2025',
    severity: 'high',
  },
  {
    id: 'ed-cbi-misuse',
    title: 'ED/CBI Washing Machine',
    summary: 'Opposition leaders join BJP, all corruption cases disappear. 115 of 121 PMLA cases were against opposition leaders. Dubbed "Washing Machine" politics - dirty politicians join BJP and get clean instantly.',
    characters: ['modi'],
    tags: ['ED', 'CBI', 'opposition', 'selective enforcement'],
    date: '2022-2025',
    severity: 'high',
  },
  {
    id: 'nep-funds',
    title: 'Modi Cuts School Funds for Tamil Nadu',
    summary: 'Centre stopped education funds to Tamil Nadu government for refusing New Education Policy (Hindi imposition). Modi using money as weapon against opposition states.',
    characters: ['modi', 'stalin'],
    tags: ['education', 'Tamil Nadu', 'Hindi imposition', 'federalism'],
    date: '2023-2024',
    severity: 'high',
  },
  {
    id: 'governor-ravi',
    title: 'Governor RN Ravi Obstructs Tamil Nadu',
    summary: 'BJP-appointed Governor RN Ravi refused to sign Tamil Nadu legislation, tried to dismiss ministers, until Supreme Court intervened. Classic Centre using Governor to destabilize opposition state.',
    characters: ['modi', 'stalin'],
    tags: ['governor', 'federalism', 'Tamil Nadu', 'BJP'],
    date: '2023',
    severity: 'high',
  },

  // ── TAMIL NADU / DMK / STALIN ────────────────────────────────
  {
    id: 'dmk-defeat-2026',
    title: 'DMK Stunning Defeat in 2026 TN Elections',
    summary: 'DMK suffered historic defeat in 2026 Tamil Nadu elections. Stalin lost from Kolathur, Udhayanidhi lost from Chepauk-Thiruvallikeni. 15 DMK ministers defeated. TVK won 108 seats. DMK blames EVMs, everyone else blames DMK\'s arrogance.',
    characters: ['stalin', 'udhayanidhi', 'vijay'],
    tags: ['2026 election', 'defeat', 'DMK', 'TVK', 'Tamil Nadu'],
    date: '2026',
    severity: 'critical',
  },
  {
    id: 'sanatana-controversy',
    title: 'Udhayanidhi Calls Sanatana Dharma a Disease',
    summary: 'Udhayanidhi Stalin compared Sanatana Dharma to dengue and malaria saying it should be eradicated, not just opposed. Massive national controversy. BJP used it to polarize voters.',
    characters: ['udhayanidhi', 'modi'],
    tags: ['Sanatana', 'religion', 'controversy', 'BJP polarization'],
    date: '2023',
    severity: 'high',
  },
  {
    id: 'nepotism-dmk',
    title: 'DMK Dynasty - Grandfather to Grandson',
    summary: 'Tamil Nadu ran by Karunanidhi dynasty: Stalin as CM, Udhayanidhi as Deputy CM, Kanimozhi in Parliament. DMK = Dravidam Maarakum Kutumbam (Family destroying Dravidian movement).',
    characters: ['stalin', 'udhayanidhi'],
    tags: ['nepotism', 'dynasty', 'DMK', 'family politics'],
    date: '2021-2026',
    severity: 'medium',
  },
  {
    id: 'dmk-congress-split',
    title: 'Congress Dumps DMK, Backs TVK',
    summary: 'After 2026 TN elections, Congress backed TVK government to keep BJP away from power, ditching old ally DMK. DMK furious, called it "opportunist". DMK may support NDA in Delhi now.',
    characters: ['stalin', 'udhayanidhi', 'vijay'],
    tags: ['Congress', 'TVK', 'DMK', 'alliance', 'betrayal'],
    date: '2026',
    severity: 'high',
  },

  // ── TVK / VIJAY ──────────────────────────────────────────────
  {
    id: 'tvk-minority-govt',
    title: 'TVK Minority Government with Congress',
    summary: 'TVK won 108 seats, short of 118 majority. Running with Congress support. Udhayanidhi calls it a "sofa-model government." Vijay now has to govern without full majority.',
    characters: ['vijay', 'udhayanidhi'],
    tags: ['TVK', '2026', 'minority government', 'Congress'],
    date: '2026',
    severity: 'medium',
  },

  // ── EDAPPADI / AIADMK ────────────────────────────────────────
  {
    id: 'eps-gutkha-scam',
    title: 'AIADMK Gutkha Scam',
    summary: 'Under EPS government, gutka baron was allegedly given protection and police transfers in exchange for money. Multiple IAS/IPS officers implicated.',
    characters: ['edappadi'],
    tags: ['scam', 'AIADMK', 'gutkha', 'corruption'],
    date: '2017-2021',
    severity: 'high',
  },

  // ── KAMAL / RAJINI ───────────────────────────────────────────
  {
    id: 'rajini-politics-exit',
    title: 'Rajini Backed Out AGAIN',
    summary: 'Rajinikanth formed Rajini Makkal Mandram, announced political entry, then backed out citing health issues before 2021 elections. Millions of fans left disappointed.',
    characters: ['rajini'],
    tags: ['Rajini', 'politics', 'backed out', 'fans', 'trust'],
    date: '2021',
    severity: 'medium',
  },
  {
    id: 'kamal-mnm-failure',
    title: 'MNM Disappointing Elections',
    summary: 'Kamal Haasan\'s Makkal Needhi Maiam barely won any seats despite huge fanfare. Kamal lost in Coimbatore. Intellectual politics vs ground reality.',
    characters: ['kamal'],
    tags: ['MNM', 'elections', 'loss', 'Coimbatore'],
    date: '2021-2024',
    severity: 'low',
  },
]

export const getEventsByCharacters = (characterIds: string[]): PoliticalEvent[] =>
  currentEvents.filter((e) => e.characters.some((c) => characterIds.includes(c)))

export const getEventById = (id: string): PoliticalEvent | undefined =>
  currentEvents.find((e) => e.id === id)
