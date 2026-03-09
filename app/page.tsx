import MeshViz from "./components/MeshViz";

const STATS = [
  { label: "RESOURCE TYPES", value: "17" },
  { label: "GRPC SERVICES", value: "6" },
  { label: "FHIR PROFILES", value: "5" },
  { label: "TARGET", value: "RPi 4" },
];

const ARCH_CARDS = [
  {
    tag: "GIT_STORE",
    text: "Every clinical write commits to Git first. FHIR R4 resources stored as JSON. SQLite is a rebuildable query index. If the index is lost, it rebuilds from Git.",
  },
  {
    tag: "MESH_SYNC",
    text: "Nodes discover each other via WiFi Direct, Bluetooth, or LAN. Sync is Git fetch/merge/push. A FHIR-aware merge driver classifies conflicts by clinical safety risk.",
  },
  {
    tag: "FHIR_R4",
    text: "Full FHIR R4 compliance for interoperability with global health systems. 17 resource types, 5 custom profiles, CapabilityStatement, and SMART on FHIR.",
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
    desc: "Post-earthquake, flood, or conflict zones. IOTA Tangle anchoring for cryptographic proof and humanitarian accountability.",
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
          <a href="#arch" className="hover:text-white transition-colors">
            ARCHITECTURE
          </a>
          <a href="#sentinel" className="hover:text-white transition-colors">
            SENTINEL
          </a>
          <a href="#targets" className="text-green-500 hover:text-green-400 transition-colors">
            DEPLOY
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
              Offline-first electronic health record for zero-connectivity
              environments. Git is the database. Sync is Git sync.
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
          <div className="hidden sm:block">MOUSE_INTERACTION: ENABLED</div>
          <div>FHIR_R4: COMPLIANT</div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="arch" className="border-t border-zinc-800 px-6 lg:px-16 py-24">
        <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">
          // ARCHITECTURE
        </div>
        <h2 className="text-2xl font-bold mb-12">
          Dual-layer <span className="text-green-500">data model</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARCH_CARDS.map((c) => (
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

      {/* ── Sentinel ── */}
      <section
        id="sentinel"
        className="border-t border-zinc-800 px-6 lg:px-16 py-24"
      >
        <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">
          // SENTINEL AGENT
        </div>
        <h2 className="text-2xl font-bold mb-6">
          AI-powered <span className="text-green-500">surveillance</span>
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          A sleeper agent that wakes on sync events. Crawls merged datasets for
          epidemiological outbreak signals using WHO IDSR thresholds, cross-site
          medication conflicts, missed referral follow-ups, and supply stockout
          predictions. Rule-based V1 — no cloud dependency.
        </p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: "10", label: "gRPC RPCs" },
            { val: "13", label: "HTTP endpoints" },
            { val: "5", label: "alert types" },
            { val: "WHO", label: "IDSR thresholds" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold text-green-500">{s.val}</div>
              <div className="text-[10px] text-zinc-600 tracking-widest mt-1">
                {s.label}
              </div>
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

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 px-6 lg:px-16 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-600">
          AGPLv3 — Open Nucleus Project
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
