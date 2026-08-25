import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI Root-Cause Diagnostic Analysis
app.post("/api/gemini/analyze-network", async (req, res) => {
  try {
    const { tracerouteData, subnetData, scanData, generalContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback rule-based analysis if Gemini API Key is not set
      const hops = tracerouteData?.hops || [];
      const highLossHops = hops.filter((h: any) => h.lossPercent > 5);
      const latencyJumps: string[] = [];

      for (let i = 1; i < hops.length; i++) {
        const delta = hops[i].avgRtt - hops[i - 1].avgRtt;
        if (delta > 20) {
          latencyJumps.push(`Hop ${hops[i].hop} (${hops[i].ip}) added +${delta.toFixed(1)}ms latency`);
        }
      }

      return res.json({
        summary: `Network diagnostic analysis conducted on target ${tracerouteData?.target || 'endpoint'}.`,
        rootCause: highLossHops.length > 0 
          ? `Sustained packet loss detected at hop ${highLossHops[0].hop} (${highLossHops[0].ip} - ${highLossHops[0].host || 'Intermediate Transit'}).`
          : latencyJumps.length > 0 
            ? `Significant latency jump observed: ${latencyJumps.join(', ')}.`
            : "Path metrics appear stable with acceptable propagation delays.",
        slaRisk: highLossHops.length > 0 ? "HIGH - Packet loss exceeds 5% enterprise threshold" : "LOW - Within normal latency bounds",
        recommendations: [
          "Verify MTU configuration across transit hops to prevent PMTUD blackholing.",
          "Check router CPU utilization and control plane policing (CoPP) on identified high-loss nodes.",
          "Inspect BGP community tags and look for asymmetric routing or path flapping.",
          "Review interface error counters (CRC errors, input drops, buffer overruns) on the local edge router."
        ],
        remediationCommands: [
          "# Cisco IOS-XE:\nshow interfaces counters errors\nshow policy-map interface control-plane",
          "# Juniper Junos:\nshow interfaces extensive | match \"error|drop\"\nshow route table inet.0 active-path",
          "# Linux / Edge Gateway:\nethtool -S eth0 | grep -E \"drop|error|miss\"\nip route get " + (tracerouteData?.target || '8.8.8.8')
        ]
      });
    }

    const prompt = `You are a Principal Network Infrastructure Engineer & Enterprise CCIE/JNCIE diagnostic expert.
Analyze the following live network telemetry collected from an enterprise diagnostic probe:

TRACEROUTE & HOP-BY-HOP TELEMETRY:
Target: ${tracerouteData?.target || 'N/A'}
Packet Count: ${tracerouteData?.packetCount || 10}
Packet Size: ${tracerouteData?.packetSize || 64} bytes
DSCP/ToS: ${tracerouteData?.dscp || 'CS0'}
Hops Data:
${JSON.stringify(tracerouteData?.hops || [], null, 2)}

SUBNET METRICS:
${JSON.stringify(subnetData || {}, null, 2)}

SCAN RESULTS (if any):
Total scanned hosts: ${scanData?.hosts?.length || 0}
Active hosts: ${scanData?.activeCount || 0}
High latency hosts: ${scanData?.highLatencyCount || 0}

Provide an authoritative, highly technical, and actionable network troubleshooting report in JSON format with the following schema:
{
  "summary": "Concise executive overview of the path quality, total RTT, jitter, and packet loss characteristics.",
  "rootCause": "Deep technical analysis of where latency jumps or packet loss originates. Differentiate between control plane ICMP rate-limiting (loss at one hop not inherited downstream) vs true forwarding-plane congestion or physical layer degradation (loss persistent through all subsequent hops).",
  "slaRisk": "CRITICAL, HIGH, MODERATE, or LOW with brief explanation regarding VoIP (MOS < 3.8), Database replication, or real-time TCP throughput.",
  "anomaliesDetected": ["Array of specific anomaly flags, e.g. 'Transatlantic cable propagation at Hop 6 (+42ms)', 'Control Plane Policing at Hop 3', 'Bufferbloat / high jitter standard deviation'"],
  "recommendations": ["Array of 3-5 concrete operational steps for the NOC / NetOps team."],
  "remediationCommands": ["Array of 2-4 exact vendor CLI commands (Cisco IOS-XE, Juniper Junos, Linux ip/tc/ethtool, Arista EOS) to pinpoint or resolve the issue."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini network analysis error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze network telemetry" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Network Diagnostics Server running on port ${PORT}`);
  });
}

startServer();
