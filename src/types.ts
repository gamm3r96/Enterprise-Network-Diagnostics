export type DiagnosticTab = 'dashboard' | 'mtr' | 'subnet' | 'scanner' | 'tools' | 'report' | 'ai' | 'settings';

export type ThemeId = 'cyber-slate' | 'matrix-terminal' | 'deep-space' | 'enterprise-light' | 'solarized-dark';

export interface UserSettings {
  theme: ThemeId;
  refreshIntervalMs: number;
  defaultPacketSize: number;
  defaultDscp: string;
  soundAlerts: boolean;
  visualFlashing: boolean;
  lossThresholdPercent: number;
  latencyThresholdMs: number;
  jitterThresholdMs: number;
  mosMinThreshold: number;
  dohProvider: 'cloudflare' | 'google' | 'quad9' | 'adguard';
  compactTablesByDefault: boolean;
  autoTriggerAiOnCritical: boolean;
}

export interface NetworkIncident {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  affectedHop?: number;
  affectedIp?: string;
  metric: string;
  value: string;
}

export interface HopDiagnostic {
  hop: number;
  ip: string;
  host: string;
  asn?: string;
  asnOrg?: string;
  isp?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isPrivate?: boolean;
  ipType?: string;
  mplsLabel?: string;
  sentCount: number;
  recvCount: number;
  lossPercent: number;
  lastRtt: number;
  avgRtt: number;
  bestRtt: number;
  worstRtt: number;
  stdDevRtt: number;
  jitter: number;
  mtu: number;
  nodeType: 'Edge' | 'Core' | 'MPLS' | 'Transit' | 'IXP' | 'Cloud Gateway' | 'Destination';
  status: 'optimal' | 'warning' | 'degraded' | 'rate-limited' | 'unresponsive';
  statusReason?: string;
  rttHistory: number[];
  degradationDelta: number; // Latency increase relative to previous hop
}

export interface DiagnosticSession {
  id: string;
  timestamp: string;
  target: string;
  targetIp: string;
  probeCount: number;
  packetSize: number; // in bytes (e.g. 64, 512, 1472, 1500)
  interval: number; // in ms (e.g. 500, 1000)
  dscp: string; // 'CS0' | 'EF' | 'AF41' | 'AF31' | 'CS6'
  hops: HopDiagnostic[];
  totalHops: number;
  targetReached: boolean;
  overallAvgRtt: number;
  overallMinRtt: number;
  overallMaxRtt: number;
  overallJitter: number;
  overallLossPercent: number;
  mosScore: number; // Voice MOS 1.0 - 4.5
  healthVerdict: 'EXCELLENT' | 'DEGRADED' | 'CRITICAL' | 'UNREACHABLE';
  isLiveProbing: boolean;
  cycleCount: number;
}

export interface SubnetCluster {
  block: string;
  range: string;
  totalIps: number;
  activeIps: number;
  utilization: number; // 0 - 100%
  avgLatency: number; // ms
  lossRate: number; // 0 - 100%
  status: 'HEALTHY' | 'ELEVATED_RTT' | 'PACKET_LOSS' | 'UNRESPONSIVE';
  dominantRole: 'Workstations' | 'Servers' | 'Kubernetes Pods' | 'IoT / Access Points' | 'Network Devices';
}

export interface SubnetAnalysis {
  cidr: string;
  ipAddress: string;
  prefixLength: number;
  netmask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalAddresses: number;
  usableHosts: number;
  binaryNetmask: string;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'CIDR';
  scope: 'RFC 1918 Private' | 'Carrier Grade NAT (RFC 6598)' | 'Loopback' | 'Link-Local' | 'Public Routable';
  hexSubnet: string;
  // Granular performance statistics
  activeHosts: number;
  utilizationPercent: number;
  p50Latency: number;
  p90Latency: number;
  p95Latency: number;
  p99Latency: number;
  avgSubnetLoss: number;
  maxJitter: number;
  fragmentationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  pathMtu: number;
  clusters: SubnetCluster[];
}

export interface PortInspection {
  port: number;
  service: string;
  status: 'open' | 'filtered' | 'closed';
  protocol: 'TCP' | 'UDP';
  banner?: string;
}

export interface HostScanResult {
  ip: string;
  hostname: string;
  status: 'ONLINE' | 'LATENCY_WARNING' | 'LOSS_WARNING' | 'OFFLINE';
  rtt: number;
  jitter: number;
  packetLoss: number;
  ttl: number;
  osFingerprint: string;
  deviceVendor: string;
  macAddress?: string;
  openPorts: PortInspection[];
  services: string[];
  lastProbeTime: string;
}

export interface ScanSession {
  targetRange: string;
  totalHosts: number;
  scannedCount: number;
  onlineCount: number;
  highLatencyCount: number;
  packetLossCount: number;
  offlineCount: number;
  isScanning: boolean;
  progressPercent: number;
  startTime: string;
  endTime?: string;
  hosts: HostScanResult[];
  selectedPorts: number[];
}

export interface AiTroubleshootingReport {
  summary: string;
  rootCause: string;
  slaRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  anomaliesDetected: string[];
  recommendations: string[];
  remediationCommands: string[];
}

export interface NetworkPreset {
  name: string;
  target: string;
  description: string;
  category: 'Cloud' | 'DNS / CDN' | 'Enterprise Core' | 'Financial IXP' | 'Telephony / SIP';
  iconName: string;
}

// -------------------------------------------------------------
// Advanced Networking Tools Types
// -------------------------------------------------------------

export type AdvancedToolId =
  | 'dns'
  | 'tcp_mathis'
  | 'mtu_calc'
  | 'bgp_looking_glass'
  | 'voip_emodel'
  | 'ipv6_toolkit';

export interface DnsRecordResult {
  type: string;
  name: string;
  data: string;
  ttl: number;
  provider?: string;
}

export interface DnsResolverBenchmark {
  name: string;
  ip: string;
  latencyMs: number;
  dnssecSupported: boolean;
  status: 'RESOLVED' | 'TIMEOUT' | 'SERVFAIL';
  ipReturned?: string;
  ttl?: number;
}

export interface DnsLookupResult {
  domain: string;
  records: DnsRecordResult[];
  resolvers: DnsResolverBenchmark[];
  dnssecValid: boolean;
  authoritativeServer: string;
  canonicalName?: string;
  queryTimeMs: number;
  timestamp: string;
}

export interface TcpThroughputResult {
  bandwidthCapacityMbps: number;
  rttMs: number;
  lossRatePercent: number;
  mssBytes: number;
  // Computed values
  theoreticalMaxThroughputMbps: number;
  bandwidthDelayProductBytes: number;
  optimalTcpWindowKBytes: number;
  transferTime100MBSeconds: number;
  transferTime1GBSeconds: number;
  lossImpactFactor: string; // e.g. "Severe (>85% degradation)"
  limitingFactor: 'Latency (BDP)' | 'Packet Loss (Mathis Limit)' | 'Line Rate Capacity';
  curveData: { lossPercent: number; throughputMbps: number }[];
}

export interface MtuOverheadResult {
  baseL2Mtu: number;
  encapsulation: string;
  totalHeaderOverheadBytes: number;
  effectiveIpMtu: number;
  effectiveTcpMss: number;
  fragmentationRisk: 'NONE' | 'LOW' | 'HIGH (Silent Drop Risk)';
  dfBitAction: 'Pass Unfragmented' | 'Fragment (L3 Router)' | 'ICMP Need-Frag (Type 3 Code 4)';
  breakdown: {
    layer: string;
    protocol: string;
    overheadBytes: number;
    description: string;
  }[];
  recommendation: string;
}

export interface BgpPathHop {
  asn: number;
  orgName: string;
  country: string;
  role: 'Origin' | 'Tier-1 Transit' | 'Peer / IXP' | 'Access Provider';
  rpkiStatus: 'VALID' | 'INVALID_ASN' | 'NOT_FOUND';
  peeringDbUrl?: string;
  irrRouteObject?: string;
  communityTags?: string[];
}

export interface BgpLookingGlassResult {
  prefix: string;
  originAsn: number;
  originOrg: string;
  asPath: number[];
  hops: BgpPathHop[];
  rpkiValidation: 'VALID' | 'INVALID' | 'NOT_FOUND';
  rpkiMaxPrefixLength: number;
  communities: { tag: string; meaning: string }[];
  routeFlapDamping: 'STABLE' | 'PENALIZED' | 'DAMPED';
  ixpInterconnects: string[];
}

export interface VoipEModelResult {
  codec: string;
  codecName: string;
  nominalBitrateKbps: number;
  rFactor: number; // 0 - 100
  mosScore: number; // 1.0 - 4.5
  qualityRating: 'Best' | 'High' | 'Medium' | 'Low' | 'Poor';
  oneWayDelayMs: number;
  jitterMs: number;
  packetLossPercent: number;
  packetizationMs: number;
  effectiveDelayMs: number;
  equipmentImpairment: number;
  delayImpairment: number;
  jitterBufferDelayMs: number;
  recommendation: string;
}

export interface Ipv6AnalysisResult {
  inputAddress: string;
  fullExpanded: string;
  compressedCanonical: string; // RFC 5952
  prefixLength: number;
  addressType: 'Global Unicast' | 'Unique Local (ULA)' | 'Link-Local' | 'Multicast' | 'Loopback' | 'IPv4-Mapped';
  scope: string;
  networkPrefix: string;
  interfaceId: string;
  total64Subnets: string;
  totalHostsInSubnet: string;
  reverseDnsPtr: string; // ip6.arpa
  solicitedNodeMulticast: string;
  eui64Address?: string;
  macUsed?: string;
}

