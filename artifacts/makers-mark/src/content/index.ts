import type {
  Achievement,
  Contact,
  Discovery,
  Structure,
  WorldMeta,
} from './types';

export * from './types';

const GH = 'https://github.com/Sarvesh5273';

export const worlds: WorldMeta[] = [
  {
    id: 'unwritten',
    number: 1,
    title: 'The Unwritten',
    material: 'fog',
    transitionAction: 'decide',
    transitionLabel: 'Decide the doorway',
  },
  {
    id: 'kingdom',
    number: 2,
    title: 'The Buried Kingdom',
    material: 'stone',
    transitionAction: 'carve',
    transitionLabel: 'Complete the carving',
  },
  {
    id: 'longAfter',
    number: 3,
    title: 'The Long After',
    material: 'ceramic',
    transitionAction: 'grab',
    transitionLabel: 'Grab the filament',
  },
  {
    id: 'presentRoom',
    number: 4,
    title: 'The Present Room',
    material: 'paper',
    transitionAction: 'read',
    transitionLabel: 'Read the sticky note',
  },
];

export const structures: Structure[] = [
  {
    id: 'bridge',
    storyName: 'The Bridge',
    unwritten: {
      projectName: 'Recall AI',
      category: 'Multilingual inventory intelligence',
      status: 'Built & field-tested',
      intent:
        'Turns handwritten kirana stock ledgers into live digital inventory from a phone — even when the internet is gone.',
      discovery:
        'Built for Hindi, Gujarati, and Marathi. A shopkeeper photographs a ledger; the system reads it, keeps working offline, and syncs when the connection returns.',
    },
    kingdom: {
      title: 'The Stone Bridge',
      ledger: [
        {
          line: 'Read three scripts: Hindi, Gujarati, Marathi.',
          gloss: 'Handwritten kirana stock ledgers, photographed on entry-level Android phones.',
        },
        {
          line: 'Four ten-thousandths per crossing.',
          gloss: 'About $0.0004 per scan, using Sarvam Vision and GPT-4o mini via Azure AI Foundry.',
        },
        {
          line: 'In four months, taught it to need the maker 93% less.',
          gloss:
            'A self-improving pipeline (training-signal lookup, semantic match, quarantine inbox) cut AI cost per scan by 93%.',
        },
        {
          line: 'Worked without the sky. Synced when the sky returned.',
          gloss: 'Offline-first on WatermelonDB, syncing to Cosmos DB when connected.',
        },
        {
          line: 'Tested with real hands at one shop.',
          gloss: 'Field-tested at Sai Store, Pune, March 2026.',
        },
      ],
      olderLedger: [
        { line: 'Read one script.' },
        { line: 'Cost more per crossing. Needed the maker for every line.' },
      ],
      evidence:
        "A shopkeeper's ledger page pressed into the stone at the far end, like a fossil. Someone else's hands.",
      records: [
        'Imagine Cup 2026: Overall Semifinalist. Launch Track Finalist.',
      ],
    },
    longAfter: {
      title: 'The Lattice',
      consequence:
        'No longer a bridge. Thousands of thin spans from every direction converge on the same keystone. Each travelling light is a scan.',
      counters: [
        { label: 'cost per crossing', value: 0.0004, suffix: ' USD' },
        { label: 'reduction in cost over four months', value: 93, suffix: '%' },
        { label: 'scripts read', value: 3 },
      ],
      nodes: [
        {
          name: 'A shopfront',
          line: 'Follow a single span outward and you arrive at a tiny shop that looks exactly like the fossil in the Kingdom.',
        },
      ],
    },
    presentRoom: {
      name: 'Recall AI',
      description:
        'A kirana store owner photographs their handwritten stock ledger in Hindi, Gujarati, or Marathi and gets live digital inventory in seconds. No typing. No barcode scanner. No internet required.',
      object: 'A phone on the desk, screen on, mid-scan of a real handwritten ledger.',
      proof: [
        'Imagine Cup 2026 badge',
        'A printout of the cost-per-scan curve',
        'A photo from Sai Store, Pune',
      ],
      links: [{ label: 'GitHub', href: `${GH}/Recall-AI` }],
      stack: [
        'React Native',
        'WatermelonDB',
        'FastAPI',
        'Azure AI Foundry',
        'Sarvam Vision',
        'Cosmos DB',
        'Redis + RQ',
      ],
    },
  },
  {
    id: 'well',
    storyName: 'The Well',
    unwritten: {
      projectName: 'MindThread',
      category: 'AI companion & memory system',
      status: 'Completed',
      intent:
        'An AI companion that retains meaningful context across conversations, then brings back what matters when it is relevant.',
      discovery:
        'Conversation memories are extracted, embedded, and recalled by similarity. Mood check-ins and insight views let the person notice patterns across days.',
    },
    kingdom: {
      title: 'The Well, and the Larger Well Beside It',
      ledger: [
        {
          line: 'Listened. Kept what mattered. Recalled it by resemblance.',
          gloss:
            'MindThread: after each conversation it extracts meaningful memories, embeds them, and recalls relevant ones by cosine similarity on the next visit.',
        },
        {
          line: 'Measured the weather of a person across days.',
          gloss: 'Mood logging with rolling averages and day-of-week patterns.',
        },
        {
          line: 'Never clinical. Always human.',
          gloss: 'Empathetic conversation on Gemini 2.5 Flash, built for the H0 Hackathon.',
        },
      ],
      records: [],
      hasUnfinishedCarving: true,
    },
    longAfter: {
      title: 'The Still Lake',
      consequence:
        'The half-cut well is finished, and enormous. Not a well now but a still lake. Its surface shows your whole journey so far, in order. Stand still, and it notices how long you have been standing.',
      nodes: [
        {
          name: 'The Companion',
          line: 'A companion that holds a lifetime of context and reflects on it. This is what the carving grew into.',
        },
      ],
    },
    presentRoom: {
      name: 'Cognitive AI Companion',
      description:
        'Ongoing independent research into persistent memory, reflection loops, affective computing, and long-context reasoning. MindThread was version zero.',
      object:
        "The whiteboard, dated today. The same diagram from the Kingdom carving, in marker, with today's open question circled.",
      proof: [
        'MindThread screenshot pinned beside it, labelled v0',
        'The only thing in the room without a finished name',
      ],
      links: [{ label: 'MindThread on GitHub', href: `${GH}/MindThread` }],
      stack: ['Memory systems', 'Reflection loops', 'Affective computing', 'Long-context reasoning'],
      unfinished: true,
      openQuestion: 'Does the memory live in the context, or beside it?',
    },
  },
  {
    id: 'gate',
    storyName: 'The Gate',
    unwritten: {
      projectName: 'AegisFlow',
      category: 'AI agent security & consent',
      status: 'Built for the Auth0 Hackathon',
      intent:
        'A zero-trust consent layer that makes an AI agent ask which action, scope, and duration it has permission to use.',
      discovery:
        'Policy checks, scoped consent through Auth0 Token Vault, and an audit record turn “the agent did it” into an answerable trail.',
    },
    kingdom: {
      title: 'Three Gates in Three Halls',
      ledger: [
        {
          line: 'First gate: which agent, which action, which scope, for how long.',
          gloss:
            'AegisFlow: a zero-trust consent layer for AI agents. Policy engine, scoped consent via Auth0 Token Vault, audit log. Built for the Auth0 hackathon.',
        },
        {
          line: 'Second gate: built into a wall. A mesh of things that were stopped.',
          gloss:
            'GhostWire: an AI firewall for enterprise LLM use. Detects, blocks, and audits risky prompts in real time with compliance-mapped explanations.',
        },
        {
          line: 'Third gate: a chain of seals. Every decision linked to the last.',
          gloss:
            'TRACE: an autonomous supply-chain disruption agent with an enterprise trust fabric. LangGraph state machine, AES-256-GCM encrypted audit trail. Hackers Occupied Pune 2026.',
        },
        {
          line: 'Same mark on all three. Each larger than the last.',
        },
      ],
      evidence: 'In every hall, a ledger scroll on the floor: a record of every pass and every refusal.',
    },
    longAfter: {
      title: 'The Rings',
      consequence:
        'The monumental arches carry smaller gates within them. Every filament passes through a ring of light before it continues. Touch a ring and it shows the chain of who asked what.',
      nodes: [
        {
          name: 'ActionForge',
          line: 'Natural language becomes a validated Splunk alert action, through a gate, with a trail.',
          href: `${GH}/ActionForge`,
        },
      ],
      trail: [
        'An agent asked.',
        'The ring asked back: which agent, which action, which scope, for how long.',
        'A scoped consent was issued. It expired on time.',
        'The pass was written to the ledger, beside every refusal.',
      ],
    },
    presentRoom: {
      name: 'AegisFlow, GhostWire, TRACE',
      description:
        'Three separate builds around one conviction: an AI agent should have to ask permission and leave a trail.',
      object: 'Three small items on one shelf, grouped together.',
      proof: [
        'An Auth0 hackathon lanyard',
        'A printed architecture diagram with GhostWire in the corner',
        'A still from the TRACE demo video',
        'A sticky note in the maker\'s hand: "Same idea. Kept coming back."',
      ],
      links: [
        { label: 'AegisFlow', href: `${GH}/AegisFlow` },
        { label: 'GhostWire', href: `${GH}/GhostWire` },
        { label: 'TRACE', href: `${GH}/HOP_PUNE` },
      ],
      stack: ['FastAPI', 'Auth0 Token Vault', 'Groq', 'LangGraph', 'Policy engines', 'Audit logging'],
    },
  },
  {
    id: 'orchard',
    storyName: 'The Orchard',
    unwritten: {
      projectName: 'ReelSense',
      category: 'Explainable recommender systems',
      status: 'Completed · 2nd Runner Up, IIEST Shibpur 2026',
      intent:
        'A movie recommender that combines collaborative filtering with content signals and explains every recommendation in plain language.',
      discovery:
        'It deliberately counters the popularity bubble: familiar films still surface, but smaller discoveries keep a share of the light.',
    },
    kingdom: {
      title: 'The Walled Orchard',
      ledger: [
        {
          line: 'Chose by resemblance and by taste.',
          gloss: 'A hybrid recommender: SVD collaborative filtering plus content-based signals.',
        },
        {
          line: 'Balanced the popular against the true.',
          gloss: 'Designed to counter the popularity bubble rather than amplify it.',
        },
        {
          line: 'Explained every choice in plain words.',
          gloss: 'Natural-language explanations for each recommendation.',
        },
        {
          line: 'At the back, a smaller grove of fourteen.',
          gloss:
            'A contribution to a CheXpert-based chest X-ray report system covering 14 labels.',
        },
      ],
      records: ['IIEST Shibpur Hackathon 2026: Second Runner Up.'],
    },
    longAfter: {
      title: 'The Even Canopy',
      consequence:
        'A forest seen from below. Vast, but strangely even. No giant trees. Light reaches the floor everywhere. Stand in one spot and the canopy shows you why, in plain words, for you.',
      why: [
        'You are shown this spot because it resembles where you have already stood, and because you chose {doorway}. Nothing near it was allowed to grow tall enough to shade it.',
        'You are shown this spot because it is popular, and also because it is true. The two were weighed against each other before you arrived.',
        'You are shown this spot because it is not popular. The canopy keeps a share of the light for what few have visited, so the same few trees never take it all.',
        'You are shown this spot because you can be told why. Every place the light reaches here can be explained in a sentence like this one.',
        'You are shown this spot because you stood still long enough to ask. The smaller grove at the back reads fourteen signs the same even way.',
      ],
    },
    presentRoom: {
      name: 'ReelSense',
      description:
        'A movie recommender that combines collaborative filtering with content signals and explains every recommendation in plain language, built to break the popularity bubble.',
      object: 'A laptop with the ReelSense demo open.',
      proof: [
        'A 2nd Runner Up certificate, IIEST Shibpur 2026',
        'An annotated MovieLens dataset printout',
        'The explanations on screen are worded exactly like the Kingdom placards',
      ],
      links: [{ label: 'GitHub', href: `${GH}/ReelSense` }],
      stack: ['Python', 'scikit-learn', 'SVD', 'MovieLens', 'LLM explanations'],
    },
  },
];

export const discoveries: Discovery[] = [
  {
    id: 'guardianos',
    name: 'GuardianOS',
    world: 'kingdom',
    line: 'A hall near the Bridge. Five tongues, a fraction of a rupee per judgement, under two hundred milliseconds.',
    description:
      'Digital fraud classification for India: text-first, deterministic, <200ms at about ₹0.12 per inference, across Gujarati, Hindi, Marathi, Tamil, and English. ET AI Hackathon 2026.',
    href: `${GH}/ET_HACK`,
  },
  {
    id: 'pitbrain',
    name: 'PitBrain',
    world: 'kingdom',
    line: 'A side hall with ten decisions carved every ninety minutes. Strategy is invisible; this made it legible.',
    description:
      'F1 race strategy intelligence. Built solo for the IBM AI Builders Challenge 2026 on IBM Granite, Docling, and FastF1.',
    href: `${GH}/PitBrain`,
  },
  {
    id: 'skillnova-voice',
    name: 'SkillNova Voice',
    world: 'kingdom',
    line: 'A small, bright record: a voice that interviewed, and listened back.',
    description:
      'A conversational AI interviewer on Gemini and ElevenLabs. Winner of the ElevenLabs Challenge criteria.',
    href: `${GH}/ai-interview-coach`,
  },
  {
    id: 'context-fetcher',
    name: 'AI Context Fetcher',
    world: 'kingdom',
    line: 'A small bronze instrument that still works when touched.',
    description:
      'A published Apify actor: a Readability-based clean-text extractor for RAG pipelines.',
    href: `${GH}/AI-Context-Fetcher`,
  },
  {
    id: 'election-journey',
    name: 'Indian Election Journey',
    world: 'kingdom',
    line: 'A mural off the main path, in two languages.',
    description:
      'A bilingual (English and Hindi) interactive guide to the Indian election process. Submitted to PromptWars Virtual by Google.',
    href: `${GH}/Prompt-Wars-Challenge-2`,
  },
  {
    id: 'airlock',
    name: 'Airlock',
    world: 'kingdom',
    line: 'A door for people who were shut out without being told why.',
    description:
      'A submission recovery engine for Reddit communities: explains AutoMod removals and walks new members through resubmission.',
    href: `${GH}/AirLock`,
  },
  {
    id: 'paperpilot',
    name: 'PaperPilot',
    world: 'longAfter',
    line: 'A young, bright structure with no Kingdom ancestor. It went straight from imagination to here.',
    description:
      'An agent-native academic research studio. Built for the OpenAI WebMCP Challenge; live on Vercel.',
    href: `${GH}/PaperPilot`,
  },
  {
    id: 'phantomops',
    name: 'PhantomOps',
    world: 'longAfter',
    line: 'A structure built by another builder, under the maker\'s direction.',
    description:
      'A public safety incident reporting platform, built entirely with Kiro AI for the Kiroween 2025 hackathon.',
    href: `${GH}/PhantomOps`,
  },
  {
    id: 'reelgap',
    name: 'ReelGap',
    world: 'presentRoom',
    line: 'One of two small tools on the desk. Built to scratch an itch.',
    description:
      'Finds high-citation papers with zero video coverage before they blow up. No login, no signup.',
    href: `${GH}/ReelGap`,
  },
  {
    id: 'stargap',
    name: 'StarGap',
    world: 'presentRoom',
    line: 'The other small tool on the desk. For the repos you starred and never came back to.',
    description:
      'A personal developer signal agent that joins GitHub stars, DEV.to reading, and HackerNews trends. WeMakeDevs x Coral hackathon.',
    href: `${GH}/StarGap`,
  },
  {
    id: 'perplexity',
    name: 'Perplexity Campus Partner',
    world: 'presentRoom',
    line: 'Something on the shelf: a badge, notes from a demo.',
    description: 'Perplexity Campus Partner, 2025. Developer education and campus community building.',
  },
];

export const achievements: Achievement[] = [
  {
    id: 'imagine-cup',
    title: 'Imagine Cup 2026',
    detail: 'Overall Semifinalist and Launch Track Finalist, for Recall AI.',
    year: 2026,
    structure: 'bridge',
  },
  {
    id: 'sai-store',
    title: 'Field deployment',
    detail: 'Recall AI tested with a real shopkeeper at Sai Store, Pune, March 2026.',
    year: 2026,
    structure: 'bridge',
  },
  {
    id: 'cost-reduction',
    title: '93% cost reduction',
    detail: 'Self-improving pipeline cut AI cost per scan by 93% over four months, to about $0.0004.',
    year: 2026,
    structure: 'bridge',
  },
  {
    id: 'iiest',
    title: 'IIEST Shibpur Hackathon 2026',
    detail: 'Second Runner Up, for ReelSense.',
    year: 2026,
    structure: 'orchard',
  },
  {
    id: 'elevenlabs',
    title: 'ElevenLabs Challenge',
    detail: 'Winner of the ElevenLabs Challenge criteria, for SkillNova Voice.',
    year: 2025,
  },
  {
    id: 'perplexity',
    title: 'Perplexity Campus Partner',
    detail: 'Developer education and campus community building.',
    year: 2025,
  },
];

export const contact: Contact = {
  name: 'Sarvesh Bijawe',
  identity: 'AI product builder. B.Tech CSE (AI), Vishwakarma Institute of Technology, Pune.',
  location: 'Pune, India',
  stickyNote: 'You found the mark. Say hello.',
  email: 'sarveshbijawe.dev@gmail.com',
  links: [
    { label: 'GitHub', href: GH },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/sarvesh-bijawe' },
    { label: 'Email', href: 'mailto:sarveshbijawe.dev@gmail.com' },
  ],
  resume: { label: 'Resume (PDF)', file: 'Sarvesh-Bijawe-Resume.pdf' },
};

export const skills: string[] = [
  'Python',
  'TypeScript / JavaScript',
  'SQL',
  'FastAPI',
  'Flask',
  'React',
  'React Native',
  'scikit-learn',
  'LLM APIs',
  'OCR pipelines',
  'Azure (AI Foundry, Cosmos DB, App Service)',
];

/** Convenience lookups. */
export const structureById = Object.fromEntries(
  structures.map((s) => [s.id, s]),
) as Record<Structure['id'], Structure>;

export const discoveriesByWorld = (world: Discovery['world']) =>
  discoveries.filter((d) => d.world === world);
