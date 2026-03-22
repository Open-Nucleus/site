import MeshViz from "./components/MeshViz";

const STATS = [
  { label: "REPOSITORIES", value: "5" },
  { label: "GRPC RPCS", value: "129" },
  { label: "FHIR RESOURCES", value: "12" },
  { label: "TARGET", value: "RPi 4" },
];

const PILLARS = [
  {
    tag: "OFFLINE_FIRST",
    text: "Every component works with zero connectivity. Git as a database, SQLite indexes, local LLMs via Ollama, Ed25519 keypairs. Cloud is optional, never required.",
  },
  {
    tag: "FHIR_R4",
    text: "Full FHIR R4 compliance across the stack. 12 indexed resource types, bidirectional Timing/Dosage conversion, FHIR Flags for alerts, and CapabilityStatement support.",
  },
  {
    tag: "MESH_SYNC",
    text: "Nodes discover each other via WiFi Direct, Bluetooth, or LAN. Sync is Git fetch/merge/push with a FHIR-aware merge driver that classifies conflicts by clinical safety risk.",
  },
];

const REPOS = [
  {
    name: "server",
    tag: "CORE_EHR",
    lang: "Go",
    license: "AGPLv3",
    headline: "Offline-first electronic health record",
    description:
      "Dual-layer architecture: Git as source of truth, SQLite as rebuildable index. 6 backend services, 8-stage middleware pipeline, 5 RBAC roles. Pure Go, no CGO.",
    stats: [
      { val: "129", label: "gRPC RPCs" },
      { val: "70", label: "REST endpoints" },
      { val: "12", label: "FHIR resources" },
      { val: "6", label: "services" },
    ],
    features: [
      "Auth, Patient, Sync, Formulary, Anchor, Sentinel services",
      "FHIR-aware merge driver with 3-tier conflict classification",
      "Ed25519 keypairs, EdDSA JWT, per-device rate limiting",
      "Auto-generated FHIR Provenance on every clinical write",
    ],
    github: "https://github.com/Open-Nucleus/server",
  },
  {
    name: "open-engram",
    tag: "AI_MEMORY",
    lang: "TypeScript",
    license: "Apache 2.0",
    headline: "Brain-inspired memory architecture for AI agents",
    description:
      "Four-store memory model — Sensory Buffer, Working Memory, Episodic, Semantic — with a 7-stage consolidation pipeline. Multi-agent knowledge sharing via PowerSync.",
    stats: [
      { val: "16", label: "npm packages" },
      { val: "661", label: "tests" },
      { val: "7", label: "pipeline stages" },
      { val: "4", label: "memory stores" },
    ],
    features: [
      "Storage: SQLite, PostgreSQL, Supabase, PowerSync",
      "Embedding: OpenAI, Transformers.js, Ollama, CLIP",
      "Integrations: Mastra, Vercel AI SDK, LangChain.js",
      "Fully offline with SQLite + Ollama, no API keys required",
    ],
    github: "https://github.com/Open-Nucleus/open-engram",
  },
  {
    name: "open-sentinel",
    tag: "SURVEILLANCE",
    lang: "Python",
    license: "Apache 2.0",
    headline: "LLM-powered passive clinical surveillance agent",
    description:
      "Sleeper agent for epidemiological monitoring. Dual-engine execution — LLM as primary path, deterministic rules as fallback. Every alert requires human review.",
    stats: [
      { val: "5", label: "core interfaces" },
      { val: "3", label: "max reflections" },
      { val: "4", label: "HW profiles" },
      { val: "4", label: "memory tiers" },
    ],
    features: [
      "Offline on Raspberry Pi 4 with Ollama (phi3:mini / llama3.2)",
      "Multi-source: FHIR, DHIS2, OpenMRS, SQLite, CSV",
      "Multi-output: FHIR Flags, webhooks, SMS, email",
      "Hallucination detection + reflection loop with confidence gating",
    ],
    github: "https://github.com/Open-Nucleus/open-sentinel",
  },
  {
    name: "open-anchor",
    tag: "IDENTITY",
    lang: "Go",
    license: "Apache 2.0",
    headline: "Blockchain-agnostic identity and data anchoring",
    description:
      "Merkle tree anchoring, DID:key method, W3C Verifiable Credentials with Ed25519Signature2020, and signed credential revocation. Single external dependency.",
    stats: [
      { val: "8", label: "credential types" },
      { val: "74", label: "tests" },
      { val: "1", label: "dependency" },
      { val: "SHA-256", label: "anchoring" },
    ],
    features: [
      "did:key method with Ed25519 — fully offline",
      "W3C Verifiable Credentials + Verifiable Presentations",
      "Signed revocation lists checked locally during verification",
      "SQLite-backed offline anchor queue with exponential backoff",
    ],
    github: "https://github.com/Open-Nucleus/open-anchor",
  },
  {
    name: "open-pharm-dosing",
    tag: "DOSING",
    lang: "Go",
    license: "Apache 2.0",
    headline: "Zero-dependency medication dosing library",
    description:
      "Parses clinical shorthand (BD, TDS, PRN) to structured data with bidirectional FHIR R4 Timing/Dosage conversion. NHS-first with international compatibility.",
    stats: [
      { val: "33", label: "dosing codes" },
      { val: "7", label: "categories" },
      { val: "0", label: "dependencies" },
      { val: "FHIR R4", label: "conversion" },
    ],
    features: [
      "Bidirectional FHIR R4 Timing/Dosage JSON mapping",
      "Schedule generation with month-aware arithmetic",
      "Canonical codes, aliases, mixed case, punctuation variants",
      "Standards: HL7 GTS, FHIR EventTiming, NHS Dose Syntax",
    ],
    github: "https://github.com/Open-Nucleus/open-pharm-dosing",
  },
];

const FEEDBACK = [
  {
    user: "fourthwaiv",
    text: "Would love to help design this. 16 years healthcare turned AI engineer.",
    tone: "POSITIVE",
    upvotes: 3,
  },
  {
    user: "paul_h",
    text: "Commenting so I'll take a look later. I used to work at ThoughtWorks and they helped with Bahmni.",
    tone: "POSITIVE",
    upvotes: 8,
  },
  {
    user: "Ditsocius",
    text: "There are some issues others have mentioned, but you're a good person, thank you for doing this.",
    tone: "POSITIVE",
    upvotes: 2,
  },
  {
    user: "wowsuchlinuxkernel",
    text: "This is really cool, I love that it is local-first! There's probably other EHR features that a paper booklet can't solve, so I applaud your project nonetheless.",
    tone: "POSITIVE",
    upvotes: 1,
  },
  {
    user: "diucameo",
    text: "Hi, I'd like to contribute on the Go and Flutter side. At least I know what FHIR references to.",
    tone: "POSITIVE",
    upvotes: 1,
  },
  {
    user: "Delicious_Garden5795",
    text: "It looks very interesting idea!",
    tone: "POSITIVE",
    upvotes: 0,
  },
  {
    user: "vicethal",
    text: "Referenced African data protection laws (Kenya DPA, Nigeria NDPA, POPIA) and caught a real bug in syncengine.go. Privacy with medical records isn't just legal mumbo-jumbo, it's something that patients deserve.",
    tone: "CONSTRUCTIVE",
    upvotes: 9,
  },
  {
    user: "SadnessOutOfContext",
    text: "Plenty of challenges, but also something that does, in fact, need doing. Getting compliance and privacy parts right from the start is more important than feature completeness.",
    tone: "CONSTRUCTIVE",
    upvotes: 2,
  },
  {
    user: "ongrabbits",
    text: "I'm a medical school dropout now developer. It makes sense to build a git-like system from the ground up. Keep us updated and good luck.",
    tone: "CONSTRUCTIVE",
    upvotes: 4,
  },
];

const TARGETS = [
  {
    code: "FOB",
    name: "Forward Operating Bases",
    desc: "Military medical units with zero reliable infrastructure. Ed25519 keypairs, offline-verifiable JWTs.",
  },
  {
    code: "DRZ",
    name: "Disaster Relief Zones",
    desc: "Post-earthquake, flood, or conflict zones. Ed25519 identity, cryptographic proof via Merkle tree anchoring and humanitarian accountability.",
  },
  {
    code: "RHC",
    name: "Rural Health Clinics",
    desc: "Small clinics in sub-Saharan Africa. Runs on a Raspberry Pi 4 or Android tablet. Zero connectivity is the default.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-500">{">"}</span>
          <span className="font-bold tracking-wider">OPEN.NUCLEUS</span>
          <span className="text-green-500 animate-pulse">_</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] text-zinc-500 tracking-widest">
          <a href="#ecosystem" className="hover:text-white transition-colors">
            ECOSYSTEM
          </a>
          <a href="#repos" className="hover:text-white transition-colors">
            REPOSITORIES
          </a>
          <a href="#targets" className="hover:text-white transition-colors">
            DEPLOY
          </a>
          <a href="#feedback" className="text-green-500 hover:text-green-400 transition-colors">
            FEEDBACK
          </a>
        </div>
        <div className="text-[11px] text-zinc-600 tracking-wider">v0.6.0</div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-center overflow-hidden grid-bg">
        <div className="scanline absolute inset-0 pointer-events-none" />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_auto] gap-8 px-6 lg:px-16 pt-16">
          {/* Left panel */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Open
              <br />
              <span className="text-green-500">Nucleus</span>
            </h1>
            <p className="mt-6 text-sm text-zinc-400 leading-relaxed max-w-sm">
              An open-source ecosystem for healthcare in zero-connectivity
              environments. Five repos. Three languages. One mission.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 status-pulse" />
              <span className="text-green-500 tracking-widest">OPERATIONAL</span>
            </div>
          </div>

          {/* Center viz */}
          <div className="relative h-[350px] sm:h-[400px] lg:h-[500px]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.04)_0%,transparent_70%)]" />
            <MeshViz />
          </div>

          {/* Right stats (desktop) */}
          <div className="hidden lg:flex flex-col justify-center gap-10 text-right">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-[10px] text-zinc-600 tracking-widest">
                  {s.label}
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile stats */}
        <div className="absolute bottom-16 left-0 right-0 flex lg:hidden justify-center gap-8 px-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[9px] text-zinc-600 tracking-widest">
                {s.label}
              </div>
              <div className="text-lg font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6 py-3 border-t border-zinc-800/50 text-[10px] text-zinc-600 tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-pulse" />
            MESH NETWORK ACTIVE
          </div>
          <div className="hidden sm:block">INTERFACE: DRAG // ZOOM // SELECT</div>
          <div>FHIR_R4: COMPLIANT</div>
        </div>
      </section>

      {/* ── Ecosystem ── */}
      <section id="ecosystem" className="border-t border-zinc-800 px-6 lg:px-16 py-24">
        <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">
          // ECOSYSTEM
        </div>
        <h2 className="text-2xl font-bold mb-4">
          A modular <span className="text-green-500">ecosystem</span>
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mb-12">
          Five interlocking repositories covering clinical records, AI memory,
          surveillance, identity, and medication dosing. Each works standalone.
          Together they form a complete offline health platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((c) => (
            <div
              key={c.tag}
              className="border border-zinc-800 p-6 hover:border-green-500/30 transition-colors"
            >
              <div className="text-green-500 text-xs tracking-widest mb-3">
                {c.tag}
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Repositories ── */}
      <section
        id="repos"
        className="border-t border-zinc-800 px-6 lg:px-16 py-24"
      >
        <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">
          // REPOSITORIES
        </div>
        <h2 className="text-2xl font-bold mb-12">
          The <span className="text-green-500">stack</span>
        </h2>
        <div className="flex flex-col gap-8">
          {REPOS.map((repo) => (
            <div
              key={repo.name}
              className="border border-zinc-800 p-6 lg:p-8 hover:border-green-500/30 transition-colors"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-green-500 text-xs tracking-widest">
                  {repo.tag}
                </span>
                <span className="inline-block px-2 py-0.5 text-[10px] tracking-wider border border-green-500/30 text-green-500/80">
                  {repo.lang}
                </span>
                <span className="inline-block px-2 py-0.5 text-[10px] tracking-wider border border-zinc-700 text-zinc-500">
                  {repo.license}
                </span>
              </div>

              {/* Name + description */}
              <h3 className="text-lg font-bold mb-1">{repo.headline}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-3xl">
                {repo.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {repo.stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-bold text-green-500">
                      {s.val}
                    </div>
                    <div className="text-[10px] text-zinc-600 tracking-widest mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
                {repo.features.map((f) => (
                  <div key={f} className="text-xs text-zinc-400 leading-relaxed">
                    <span className="text-green-500 mr-2">{">"}</span>
                    {f}
                  </div>
                ))}
              </div>

              {/* GitHub link */}
              <a
                href={repo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 hover:text-green-500 transition-colors tracking-wider"
              >
                {repo.github.replace("https://github.com/", "")} &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deployment Targets ── */}
      <section
        id="targets"
        className="border-t border-zinc-800 px-6 lg:px-16 py-24"
      >
        <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">
          // DEPLOYMENT TARGETS
        </div>
        <h2 className="text-2xl font-bold mb-12">
          Built for the <span className="text-green-500">edge</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {TARGETS.map((t) => (
            <div key={t.code} className="group">
              <div className="text-3xl font-bold text-zinc-800 group-hover:text-green-500/60 transition-colors mb-2">
                [{t.code}]
              </div>
              <div className="text-sm font-bold mb-1">{t.name}</div>
              <p className="text-xs text-zinc-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community Feedback ── */}
      <section
        id="feedback"
        className="border-t border-zinc-800 px-6 lg:px-16 py-24"
      >
        <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">
          // COMMUNITY FEEDBACK
        </div>
        <h2 className="text-2xl font-bold mb-4">
          From the <span className="text-green-500">community</span>
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-12">
          Posted on{" "}
          <a
            href="https://www.reddit.com/r/opensource/comments/1rlfw5k/im_a_doctor_building_an_opensource_ehr_for/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            r/opensource
          </a>
          {" "}&mdash; 151 upvotes &middot; 39K views
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEEDBACK.map((f) => (
            <div
              key={f.user}
              className="border border-zinc-800 p-6 hover:border-green-500/30 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-500 text-xs tracking-wider">
                    u/{f.user}
                  </span>
                  <span
                    className={`text-[9px] tracking-widest ${
                      f.tone === "POSITIVE"
                        ? "text-green-500/60"
                        : "text-zinc-500"
                    }`}
                  >
                    {f.tone}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  &ldquo;{f.text}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[10px] text-zinc-600 tracking-wider">
                <span>&uarr;</span>
                <span>{f.upvotes}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 px-6 lg:px-16 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-600">
          Open Nucleus Project — AGPLv3 + Apache 2.0
        </div>
        <a
          href="https://github.com/open-nucleus"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4 hover:text-green-500 transition-colors"
        >
          GitHub &rarr;
        </a>
      </footer>
    </div>
  );
}
