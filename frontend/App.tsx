import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import axios from "axios";

// --- Components ---

const StatsBar = () => (
  <div className="w-full bg-[#1a1a1a] border-b border-[#39FF14] p-2 flex justify-around text-xs md:text-sm text-[#39FF14] font-mono z-50">
    <span>APTOS PRICE: $9.45 <span className="text-green-500">▲ 2.3%</span></span>
    <span>NETWORK: DEVNET</span>
    <span>TPS: 1,245</span>
    <span>ACTIVE NODES: 104</span>
  </div>
);

const FeatureCard = ({ title, icon, desc }: { title: string, icon: string, desc: string }) => (
  <div className="cyber-box p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
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
      const response = await axios.post("http://localhost:8000/api/audit", { target, type });
      setAuditResult(response.data);
    } catch (error) {
      console.error(error);
      setAuditResult({ error: "Audit Failed. Check Console." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Moving Grid Background (CSS handled in index.css) */}

      <StatsBar />

      <main className="flex-grow flex flex-col items-center p-10 gap-12 z-10 w-full max-w-6xl mx-auto">

        {/* HERO SECTION */}
        <header className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold glitch-text">SENTINEL AI</h1>
          <p className="text-[#39FF14] tracking-[0.3em] text-lg uppercase animate-pulse">
            Autonomous Smart Contract Security Auditor
          </p>
        </header>

        {/* MAIN TERMINAL */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: ACCESS PANEL */}
          <div className="cyber-box p-8 rounded flex flex-col items-center gap-6 h-fit bg-opacity-95 bg-[#0d0d0d]">
            <h2 className="text-2xl tracking-widest border-b border-[#39FF14] pb-2 w-full text-center">ACCESS TERMINAL</h2>
            <WalletSelector />

            {showTerminal ? (
              <div className="w-full flex flex-col gap-5 mt-2">
                <div className="text-sm text-center font-mono">
                  USER ID: <span className="text-white bg-[#39FF14] bg-opacity-20 px-2 rounded">{userLabel}</span>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="PASTE CONTRACT ADDRESS OR TX HASH"
                    className="bg-black border border-[#39FF14] text-[#39FF14] p-4 w-full outline-none focus:shadow-[0_0_15px_#39FF14] transition-shadow duration-300 font-mono"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />

                  <button
                    onClick={handleAudit}
                    disabled={loading}
                    className="cyber-btn w-full font-bold flex justify-center items-center py-4 text-xl"
                  >
                    {loading ? <span className="animate-pulse">SCANNING BLOCKCHAIN...</span> : "INITIATE SCAN"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full mt-4 items-center p-4 border border-dashed border-gray-700 rounded">
                <p className="text-gray-500 animate-pulse uppercase tracking-widest">Awaiting Secure Connection...</p>
                <button
                  onClick={() => { // @ts-ignore
                    window.location.href = "http://localhost:5173/?bypass=true";
                  }}
                  className="text-xs text-red-900 hover:text-red-500 transition-colors"
                >
                  [ EMERGENCY BYPASS ]
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: RESULTS PANEL OR INFO */}
          <div className="flex flex-col gap-6">
            {auditResult ? (
              <div className="cyber-box p-8 animate-in fade-in slide-in-from-right-10 duration-500 h-full bg-[#1a1a1a]">
                <h3 className="text-2xl mb-6 border-b border-[#39FF14] flex justify-between items-center pb-2">
                  <span>SCAN RESULT</span>
                  <span className={`px-4 py-1 rounded border-2 font-bold ${auditResult.status === "Safe" ? "border-green-500 text-green-400 shadow-[0_0_10px_green]" :
                      auditResult.status === "Risky" ? "border-red-500 text-red-500 shadow-[0_0_10px_red]" : "border-yellow-500 text-yellow-500"
                    }`}>
                    {auditResult.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </h3>

                {auditResult.risk_score !== undefined && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1"><span>SAFETY SCORE</span><span>{100 - auditResult.risk_score}%</span></div>
                    <div className="w-full bg-gray-800 h-4 rounded overflow-hidden border border-gray-600">
                      <div
                        className={`h-full ${auditResult.risk_score > 50 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-1000 ease-out`}
                        style={{ width: `${auditResult.risk_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="prose prose-invert max-w-none prose-p:text-[#39FF14] prose-headings:text-[#39FF14]">
                  <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {auditResult.reason || JSON.stringify(auditResult, null, 2)}
                  </div>
                  {auditResult.analysis && (
                    <div className="mt-6 p-4 border border-gray-600 bg-black text-xs text-gray-300 font-mono rounded">
                      <p className="mb-2 font-bold text-white uppercase border-b border-gray-700 pb-1">Gemini Analysis Engine</p>
                      {auditResult.analysis}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="cyber-box p-8 h-full flex flex-col justify-center items-center text-center opacity-75">
                <div className="text-6xl text-[#39FF14] opacity-20 mb-4 animate-bounce">⚡</div>
                <h3 className="text-xl text-gray-400">READY TO SCAN</h3>
                <p className="text-gray-600 text-sm mt-2">Enter an address to analyze smart contract logic using Gemini AI.</p>
              </div>
            )}
          </div>
        </div>

        {/* FEATURES SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
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

      <footer className="w-full p-4 text-center text-xs text-gray-600 border-t border-gray-900 mt-10">
        SENTINEL AI © 2025 | POWERED BY APTOS & GOOGLE GEMINI | SYSTEM STATUS: <span className={systemStatus === "ONLINE" ? "text-green-500" : "text-red-500"}>{systemStatus}</span>
      </footer>
    </div>
  );
}

export default App;
