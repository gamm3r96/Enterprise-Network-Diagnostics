# NetTrace Enterprise — CCIE Network Telemetry & Diagnostic Suite

[![Version](https://img.shields.io/badge/version-2.4--CCIE-cyan.svg)](https://github.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20Offline-emerald.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Enterprise network latency, packet loss, and hop-by-hop MTR diagnostic suite with Executive NOC dashboard, QoS DSCP & PMTUD MTU analysis, subnet performance matrix, IP range scanner, DoH DNS, TCP Mathis, BGP Looking Glass, VoIP MOS models, and exportable PDF SLA reports.**

---

## 🚀 Key Modules & Capabilities

### 1. 🌐 Executive NOC Dashboard
- Real-time network health index scoring (0–100%)
- Global latency distribution histograms and Mean Opinion Score (MOS) ITU-T G.107 VoIP voice quality calculator
- High-priority operational alerts for packet loss anomalies, flapping hops, and latency spikes
- Quick-switch diagnostic presets (Google DNS, Cloudflare Anycast, Quad9, Cisco OpenDNS, Azure Backbone, Local Loopback)

### 2. ⚡ Hop-by-Hop MTR & Path Telemetry
- Multi-cycle traceroute engine capturing Min, Avg, Max RTT, RFC 3393 Jitter, and RFC 2681 One-Way Latency
- Autonomous ICMP rate-limiting detection to distinguish legitimate carrier loss from router control-plane protection
- Autonomous System (ASN) and geographic BGP route resolution for intermediate hops
- Frame MTU / Packet Size customization (64B VoIP up to 1500B Full MTU)
- DSCP / ToS (Type of Service) QoS packet classification (CS0 Best Effort, CS1 Scavenger, AF11 Bulk Data, AF21 Transactional, AF31 Call Signaling, AF41 Video, EF Voice RTP 0xB8, CS6/CS7 Network Control) with interactive RFC-grounded tooltips

### 3. 📐 Subnet Matrix & VLSM Calculator
- Visual IP allocation grid for classless inter-domain routing (`/8` down to `/32`)
- Usable host ranges, network address, broadcast address, and wildcard masks
- Subnet latency benchmarking and hop distribution breakdown
- 1-click transition to scan or trace discovered subnets

### 4. 🔍 IP Range & Port Scanner
- Multi-threaded ping sweep and port discovery for IP blocks (e.g. `10.0.4.1 - 10.0.4.24`)
- Live host state detection (Active, Degraded, Unreachable) with TTL and banner identification
- Port auditing across standard enterprise ports (SSH 22, DNS 53, HTTP 80, HTTPS 443, RDP 3389)

### 5. 🛠️ Advanced Protocol Analysis Tools
- **DNS-over-HTTPS (DoH) Resolver**: Query A, AAAA, MX, TXT, NS, and CNAME records with low-latency DoH (Cloudflare, Google, Quad9)
- **Path MTU Discovery (PMTUD) & MSS Calculator**: Calculate maximum transmission units and TCP MSS across standard Ethernet, PPPoE, GRE, IPsec ESP, VXLAN, and MPLS tunnels
- **TCP Throughput (Mathis Formula)**: Model maximum achievable TCP throughput based on `BW = (MSS / RTT) * (C / sqrt(Loss))`
- **BGP Looking Glass**: Query IP/Prefix routing tables, AS-PATH strings, and origin BGP communities
- **VoIP Call Quality (MOS G.107)**: Real-time calculation of R-factor and Mean Opinion Score (1.0 - 4.5)

### 6. 📄 Enterprise PDF Diagnostic Audit Reports
- Generates comprehensive, client-ready SLA audit reports with ticket tracking, executive summary, hop-by-hop telemetry tables, and AI recommendations using `jspdf` and `jspdf-autotable`

### 7. 🤖 CCIE AI Root-Cause Diagnostic Assistant
- Context-aware automated troubleshooting analysis that processes active traceroutes, flags path anomalies, classifies rate-limiting vs link degradation, and outlines step-by-step remediation plans

### 8. 📱 Progressive Web App (PWA) & Offline Capability
- Installable as a standalone native app on macOS, Windows, Linux, Android, and iOS
- Custom service worker (`sw.js`) and Web App Manifest (`manifest.json`)
- Offline operation for local calculation engines (Subnet Matrix, PMTUD calculator, VoIP MOS, TCP Mathis)

---

## ⌨️ CCIE Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Toggle Continuous Live MTR Probing (Start / Stop) |
| <kbd>R</kbd> | Execute Single Diagnostic Probe Cycle |
| <kbd>P</kbd> | Generate & Export Enterprise PDF Diagnostic SLA Report |
| <kbd>T</kbd> | Cycle Color Theme (*Cyber Slate*, *Matrix Terminal*, *Deep Space*, *Enterprise Light*, *Solarized Dark*) |
| <kbd>I</kbd> | Open App Installation Options (Desktop & Mobile PWA) |
| <kbd>M</kbd> | Toggle Sound Engine Telemetry Alerts |
| <kbd>?</kbd> | Open Keyboard Shortcuts Reference |
| <kbd>1</kbd>–<kbd>8</kbd> | Switch Workspace Views (1: Dashboard, 2: MTR, 3: Subnet, 4: Scanner, 5: Tools, 6: Report, 7: AI, 8: Settings) |
| <kbd>Esc</kbd> | Close any active modal dialog |

---

## 📜 RFC Standards Implemented

- **RFC 792**: Internet Control Message Protocol (ICMP) Specification
- **RFC 1191 & RFC 4821**: Path MTU Discovery (PMTUD) & Packetization Layer PMTUD
- **RFC 2474 & RFC 4594**: Definition of the Differentiated Services Field (DS Field / DSCP / ToS)
- **RFC 2681**: A Round-trip Delay Metric for IP Performance Metrics (IPPM)
- **RFC 3393**: IP Packet Delay Variation Metric (Jitter)
- **RFC 1889 & ITU-T G.107**: Real-Time Transport Protocol (RTP) & The E-model VoIP MOS Formulation
- **RFC 8484**: DNS Queries over HTTPS (DoH)

---

## 💻 Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 3.4 with Frosted Glassmorphism & High-Contrast NOC Themes
- **Icons**: Lucide React
- **Charts & Histograms**: Custom SVG & Recharts
- **PDF Generation**: jsPDF & jsPDF-AutoTable
- **Audio Engine**: Web Audio API Synthesized Probes & Alarms
- **PWA**: Service Worker Cache API & Web Manifest

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/nettrace-enterprise.git

# Navigate to project directory
cd nettrace-enterprise

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build
```bash
npm run build
```

---

## 📦 PWA Installation Guide

1. **Google Chrome / Microsoft Edge (macOS & Windows)**:
   - Click the **Install App** button in the header (or press <kbd>I</kbd>), or click the install icon in the browser address bar.
2. **Apple Safari (iOS & iPadOS)**:
   - Tap the **Share** button in Safari and select **Add to Home Screen**.
3. **Google Chrome (Android)**:
   - Tap the three-dot menu and select **Install App** / **Add to Home Screen**.

---

## 🔒 Security & Architecture

- **Client-Side Privacy**: DNS and socket diagnostics execute securely without storing customer IP addresses on external third-party servers.
- **Zero Decoy Artifacts**: Clean production-ready codebase stripped of decoy files and placeholder stubs.
- **Defensive Error Handling**: Network fallbacks ensure graceful degradation if target hosts reject ICMP echo requests.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
