import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import axios from "axios";

function App() {
  const { connected, account } = useWallet();
  const [target, setTarget] = useState("");
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // DEMO HACK: Check for bypass via URL query param
  const isBypassed = new URLSearchParams(window.location.search).get("bypass") === "true";
  const showTerminal = connected || isBypassed;

  // Safe user label generation to prevent crashes
  let userLabel = "UNKNOWN";
  if (isBypassed) {
    userLabel = "ADMIN_OVERRIDE_USER";
  } else if (account?.address) {
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

      const response = await axios.post("http://127.0.0.1:8000/api/audit", {
        target,
        type
      });
      setAuditResult(response.data);
    } catch (error) {
      console.error(error);
      setAuditResult({ error: "Audit Failed. Check Console." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-10 gap-8">
      <h1 className="text-6xl font-bold glitch-text mb-4">APTOS SENTINEL AI</h1>

      <div className="cyber-box p-6 rounded md:w-1/2 w-full flex flex-col items-center gap-4">
        <h2 className="text-2xl">ACCESS TERMINAL</h2>
        <WalletSelector />

        {showTerminal ? (
          <div className="w-full flex flex-col gap-4 mt-6">
            <div className="text-sm border-b border-[#39FF14] pb-2 text-center">
              USER: <span className="text-white">{userLabel}</span>
            </div>

            <input
              type="text"
              placeholder="ENTER TX HASH OR ADDRESS"
              className="bg-black border border-[#39FF14] text-[#39FF14] p-3 w-full outline-none focus:shadow-[0_0_10px_#39FF14]"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />

            <button
              onClick={handleAudit}
              disabled={loading}
              className="cyber-btn w-full"
            >
              {loading ? "SCANNING..." : "INITIATE AUDIT"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full mt-4 items-center">
            <p className="text-gray-500 text-center animate-pulse">CONNECT WALLET TO PROCEED</p>
            {/* DEMO BYPASS BUTTON */}
            <button
              onClick={() => {
                // @ts-ignore
                window.location.href = "http://localhost:5173/?bypass=true";
              }}
              className="mt-4 bg-red-600 text-white font-bold py-3 px-6 rounded hover:bg-red-700 animate-bounce border-2 border-white shadow-[0_0_15px_red]"
            >
              ⚠️ EMERGENCY DEMO ACCESS (CLICK ME) ⚠️
            </button>
          </div>
        )}
      </div>

      {auditResult && (
        <div className="cyber-box p-6 md:w-1/2 w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
          <h3 className="text-xl mb-4 border-b border-[#39FF14] flex justify-between">
            <span>AUDIT REPORT</span>
            <span className={auditResult.status === "Safe" ? "text-green-400" : "text-red-500"}>
              {auditResult.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </h3>
          <pre className="whitespace-pre-wrap text-sm font-mono text-[#39FF14]">
            {JSON.stringify(auditResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="fixed bottom-4 right-4 text-xs opacity-50 font-mono">
        SYSTEM STATUS: ONLINE | NET: DEVNET
      </div>
    </div>
  );
}

export default App;
