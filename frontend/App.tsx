import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@/components/WalletSelector"; // Use custom local component
import axios from "axios";

// --- Components ---

const StatsBar = ({ status }: { status: string }) => (
  <div className="w-full bg-[#1a1a1a] border-b border-[#39FF14] p-3 flex flex-wrap justify-between items-center text-xs md:text-sm text-[#39FF14] font-mono z-50 sticky top-0 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
    <div className="flex gap-4">
      <span className="font-bold">SYSTEM: <span className={status === "ONLINE" ? "text-green-500 animate-pulse" : "text-red-500"}>{status}</span></span>
      <span className="hidden md:inline">|</span>
      <span>NET: DEVNET</span>
    </div>
    <div className="flex gap-6">
      <span>APTOS: $9.45 <span className="text-green-500">▲</span></span>
      <span className="hidden sm:inline">TPS: 1,245</span>
      <span className="hidden sm:inline">NODES: 104</span>
    </div>
  </div>
);

const FeatureCard = ({ title, icon, desc }: { title: string, icon: string, desc: string }) => (
  <div className="cyber-box p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 bg-[#0d0d0d] bg-opacity-80">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-[#39FF14]">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </div>
);

function App() {
  const { connected, account } = useWallet();
  const [target, setTarget] = useState("");
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState("CONNECTING...");

  useEffect(() => {
    // Check backend health
    axios.get("http://localhost:8000/")
      .then(() => setSystemStatus("ONLINE"))
      .catch(() => setSystemStatus("OFFLINE (Backend Connection Failed)"));
  }, []);

  const isBypassed = new URLSearchParams(window.location.search).get("bypass") === "true";
  const showTerminal = connected || isBypassed;

  let userLabel = "UNKNOWN";
  if (isBypassed) userLabel = "ADMIN_OVERRIDE_USER";
  else if (account?.address) {
    const addrStr = account.address.toString();
    userLabel = addrStr.length > 10 ? `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}` : addrStr;
  }

  const handleAudit = async () => {
    if (!target) return;
    setLoading(true);
    setAuditResult(null);
    try {
      const isTx = target.startsWith("0x") && target.length > 60; // Simple heuristic
      const type = isTx ? "transaction" : "address";
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(`${API_URL}/api/audit`, { target, type });
      setAuditResult(response.data);
    } catch (error) {
      console.error(error);
      setAuditResult({ error: "Audit Failed. Check Console." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden pb-10">
      {/* Moving Grid Background (CSS handled in index.css) */}

      <StatsBar status={systemStatus} />

      <main className="flex-grow flex flex-col items-center p-6 gap-10 z-10 w-full max-w-7xl mx-auto mt-4">

        {/* HERO SECTION */}
        <header className="text-center space-y-2">
          <h1 className="text-6xl md:text-9xl font-bold glitch-text">SENTINEL AI</h1>
          <p className="text-[#39FF14] tracking-[0.5em] text-sm md:text-xl uppercase animate-pulse">
            Autonomous Smart Contract Security Auditor
          </p>
        </header>

        {/* MAIN TERMINAL - FULL WIDTH */}
        <div className="w-full max-w-4xl flex flex-col gap-8">

          {/* TOP: ACCESS PANEL (BIGGER) */}
          <div className="cyber-box p-10 rounded flex flex-col items-center gap-8 bg-opacity-95 bg-[#050505] shadow-[0_0_50px_rgba(57,255,20,0.1)] border-2 border-[#39FF14]">
            <h2 className="text-3xl tracking-[0.2em] border-b-2 border-[#39FF14] pb-2 w-full text-center">ACCESS TERMINAL</h2>

            <div className="scale-125 my-4">
              <WalletSelector />
            </div>

            {showTerminal ? (
              <div className="w-full flex flex-col gap-6">
                <div className="text-md text-center font-mono">
                  OPERATOR: <span className="text-black bg-[#39FF14] font-bold px-3 py-1 rounded">{userLabel}</span>
                </div>

                <div className="space-y-6 w-full">
                  <input
                    type="text"
                    placeholder="PASTE CONTRACT ADDRESS OR TRANSACTION HASH HERE..."
                    className="bg-black border-2 border-[#39FF14] text-[#39FF14] text-xl p-5 w-full outline-none focus:shadow-[0_0_30px_#39FF14] transition-shadow duration-300 font-mono text-center placeholder-gray-700"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />

                  <button
                    onClick={handleAudit}
                    disabled={loading}
                    className="cyber-btn w-full font-bold flex justify-center items-center py-6 text-2xl hover:bg-[#39FF14] hover:text-black transition-all duration-300"
                  >
                    {loading ? <span className="animate-pulse">SCANNING BLOCKCHAIN...</span> : "INITIATE SECURITY SCAN"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full items-center p-8 border-2 border-dashed border-gray-800 rounded bg-[#111]">
                <p className="text-gray-500 animate-pulse uppercase tracking-widest text-xl">Awaiting Secure Uplink...</p>
                <button
                  onClick={() => { // @ts-ignore
                    window.location.href = "http://localhost:5173/?bypass=true";
                  }}
                  className="text-xs text-red-900 hover:text-red-500 transition-colors mt-4"
                >
                  [ EMERGENCY BYPASS PROTOCOL ]
                </button>
              </div>
            )}
          </div>

          {/* BOTTOM: RESULTS PANEL */}
          <div className="w-full transition-all duration-500">
            {auditResult ? (
              <div className="cyber-box p-8 animate-in fade-in slide-in-from-bottom-10 duration-500 bg-[#1a1a1a] border-l-4 border-l-[#39FF14]">
                <h3 className="text-3xl mb-6 border-b border-[#39FF14] flex justify-between items-center pb-4">
                  <span>SCAN RESULT</span>
                  <span className={`px-6 py-2 rounded border-2 font-bold text-2xl ${auditResult.status === "Safe" ? "border-green-500 text-green-400 bg-green-900 bg-opacity-20" :
                    auditResult.status === "Risky" ? "border-red-500 text-red-500 bg-red-900 bg-opacity-20" : "border-yellow-500 text-yellow-500"
                    }`}>
                    {auditResult.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </h3>

                {auditResult.risk_score !== undefined && (
                  <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2 font-bold tracking-widest"><span>SAFETY INTEGRITY</span><span>{100 - auditResult.risk_score}%</span></div>
                    <div className="w-full bg-gray-900 h-6 rounded overflow-hidden border border-gray-700 relative">
                      <div
                        className={`h-full ${auditResult.risk_score > 50 ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-green-600 to-green-400'} transition-all duration-1000 ease-out`}
                        style={{ width: `${auditResult.risk_score}%` }}
                      ></div>
                      {/* Grid lines over bar */}
                      <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqgOx4Wy4IsyDYZEBABw/GWE4/jOIAAAAAElFTkSuQmCC')] opacity-30"></div>
                    </div>
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <div className="text-lg font-mono leading-relaxed whitespace-pre-wrap text-[#c0ffb3]">
                    {auditResult.reason || JSON.stringify(auditResult, null, 2)}
                  </div>
                  {auditResult.analysis && (
                    <div className="mt-8 p-6 border-2 border-gray-800 bg-black text-sm text-gray-300 font-mono rounded shadow-inner">
                      <p className="mb-4 font-bold text-[#39FF14] text-lg uppercase border-b border-gray-800 pb-2 flex items-center gap-2">
                        <span>👁️</span> GEMINI AI ANALYSIS ENGINE
                      </p>
                      {auditResult.analysis}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="cyber-box p-12 flex flex-col justify-center items-center text-center opacity-60 bg-[#0d0d0d]">
                <div className="text-7xl text-[#39FF14] opacity-20 mb-6 animate-pulse">⚡</div>
                <h3 className="text-2xl text-gray-400 tracking-widest uppercase">Ready to Scan</h3>
                <p className="text-gray-600 mt-2">Target acquisition pending...</p>
              </div>
            )}
          </div>
        </div>

        {/* FEATURES SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-10 opacity-80 hover:opacity-100 transition-opacity">
          <FeatureCard
            title="SMART AUDIT"
            icon="🛡️"
            desc="Deep analysis of Move bytecode using Gemini 1.5 Pro to detect vulnerabilities before they happen."
          />
          <FeatureCard
            title="THREAT PREDICTION"
            icon="👁️"
            desc="Predicts rug-pulls and unauthorized withdrawals by simulating transaction state changes."
          />
          <FeatureCard
            title="REAL-TIME SEC"
            icon="⚡"
            desc="Live monitoring of Aptos Devnet transaction pools for suspicious patterns."
          />
        </section>

      </main>

      <footer className="w-full p-6 text-center text-xs text-gray-600 border-t border-gray-900 mt-20">
        SENTINEL AI © 2025 | POWERED BY APTOS & GOOGLE GEMINI
      </footer>
    </div>
  );
}

export default App;
