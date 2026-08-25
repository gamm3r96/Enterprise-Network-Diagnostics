import { HopDiagnostic, SubnetAnalysis, SubnetCluster, HostScanResult, DiagnosticSession } from '../types';

// Convert IPv4 string to 32-bit unsigned number
export function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return 0;
  }
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

// Convert 32-bit unsigned number to IPv4 string
export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

// Calculate Standard Deviation of an array of numbers
export function calculateStdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// Calculate RFC 3393 Jitter (Mean deviation of packet intervals)
export function calculateJitter(rtts: number[]): number {
  if (rtts.length <= 1) return 0;
  let totalDelta = 0;
  for (let i = 1; i < rtts.length; i++) {
    totalDelta += Math.abs(rtts[i] - rtts[i - 1]);
  }
  return totalDelta / (rtts.length - 1);
}

// Calculate VoIP Mean Opinion Score (MOS) from RTT, Jitter, and Packet Loss
export function calculateMosScore(avgRtt: number, jitter: number, lossPercent: number): number {
  // Effective latency = one-way delay + 2 * jitter (approximation)
  const oneWayDelay = avgRtt / 2;
  const effectiveDelay = oneWayDelay + (jitter * 2);

  // Delay impairment Id
  let Id = 0;
  if (effectiveDelay > 160) {
    Id = (effectiveDelay - 160) / 10;
  }

  // Equipment/loss impairment Ie
  const lossRate = lossPercent / 100;
  const Ie = (lossRate * 95) + (jitter > 30 ? (jitter - 30) * 0.5 : 0);

  // Base R-factor
  let R = 93.2 - Id - Ie;
  if (R < 0) R = 0;
  if (R > 100) R = 100;

  // Convert R-factor to MOS (1.0 - 4.5 scale)
  if (R < 6.5) return 1.0;
  const mos = 1 + 0.035 * R + R * (R - 60) * (100 - R) * 0.000007;
  return Number(Math.min(4.41, Math.max(1.0, mos)).toFixed(2));
}

// Subnet Calculator & Granular Performance Engine
export function calculateSubnetAnalysis(cidrInput: string): SubnetAnalysis {
  let [ipStr, prefixStr] = cidrInput.trim().split('/');
  if (!prefixStr) prefixStr = '24';
  if (!ipStr) ipStr = '192.168.1.0';

  let prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0) prefix = 24;
  if (prefix > 32) prefix = 32;

  const ipLong = ipToLong(ipStr);
  const netmaskLong = prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1) >>> 0);
  const wildcardLong = (~netmaskLong) >>> 0;
  const networkLong = (ipLong & netmaskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalAddresses = prefix === 32 ? 1 : Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);

  const firstUsableLong = prefix >= 31 ? networkLong : networkLong + 1;
  const lastUsableLong = prefix >= 31 ? broadcastLong : broadcastLong - 1;

  // Binary Representation
  const binaryNetmask = (netmaskLong >>> 0).toString(2).padStart(32, '0').match(/.{1,8}/g)?.join('.') || '';

  // Hexadecimal Subnet
  const hexSubnet = '0x' + (netmaskLong >>> 0).toString(16).toUpperCase().padStart(8, '0');

  // Classification
  let ipClass: SubnetAnalysis['ipClass'] = 'CIDR';
  const firstOctet = (ipLong >>> 24) & 255;
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'A';
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D';
  else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'E';

  // Scope detection
  let scope: SubnetAnalysis['scope'] = 'Public Routable';
  if (firstOctet === 10) scope = 'RFC 1918 Private';
  else if (firstOctet === 172 && ((ipLong >>> 16) & 255) >= 16 && ((ipLong >>> 16) & 255) <= 31) scope = 'RFC 1918 Private';
  else if (firstOctet === 192 && ((ipLong >>> 16) & 255) === 168) scope = 'RFC 1918 Private';
  else if (firstOctet === 100 && ((ipLong >>> 16) & 255) >= 64 && ((ipLong >>> 16) & 255) <= 127) scope = 'Carrier Grade NAT (RFC 6598)';
  else if (firstOctet === 127) scope = 'Loopback';
  else if (firstOctet === 169 && ((ipLong >>> 16) & 255) === 254) scope = 'Link-Local';

  // Granular Subnet Performance Simulation across clusters
  const clusterCount = Math.min(8, Math.max(2, Math.floor(Math.pow(2, Math.max(1, 30 - prefix)))));
  const clusterSize = Math.max(1, Math.floor(totalAddresses / clusterCount));
  const clusters: SubnetCluster[] = [];

  const roles: SubnetCluster['dominantRole'][] = [
    'Network Devices',
    'Servers',
    'Kubernetes Pods',
    'Workstations',
    'IoT / Access Points',
    'Workstations',
    'Servers',
    'Network Devices'
  ];

  let simulatedTotalActive = 0;
  const latencies: number[] = [];
  let totalLossAcc = 0;

  for (let i = 0; i < Math.min(8, clusterCount); i++) {
    const cStart = networkLong + (i * clusterSize);
    const cEnd = Math.min(broadcastLong, cStart + clusterSize - 1);
    const ipsInCluster = Math.min(clusterSize, cEnd - cStart + 1);
    
    // Simulate real enterprise utilization patterns
    const utilFactor = 0.45 + (Math.sin(i * 1.5 + firstOctet) * 0.35);
    const clampedUtil = Math.max(0.15, Math.min(0.92, utilFactor));
    const activeIps = Math.round(ipsInCluster * clampedUtil);
    simulatedTotalActive += activeIps;

    // Cluster latency & loss distribution
    let clusterLatency = 1.2 + (i * 0.8) + (Math.cos(i + firstOctet) * 1.2);
    if (i === 3 && scope === 'RFC 1918 Private') clusterLatency += 4.5; // WiFi/Workstation jitter
    let clusterLoss = i === 2 ? 1.8 : (i === 5 ? 0.6 : 0.0);
    totalLossAcc += clusterLoss;

    for (let k = 0; k < 20; k++) {
      latencies.push(clusterLatency + (Math.random() * 2.5 - 1.2));
    }

    let status: SubnetCluster['status'] = 'HEALTHY';
    if (clusterLoss > 1.0) status = 'PACKET_LOSS';
    else if (clusterLatency > 5.0) status = 'ELEVATED_RTT';

    clusters.push({
      block: `${longToIp(cStart)}/${Math.min(32, prefix + 3)}`,
      range: `${longToIp(cStart)} - ${longToIp(cEnd)}`,
      totalIps: ipsInCluster,
      activeIps,
      utilization: Math.round(clampedUtil * 100),
      avgLatency: Number(clusterLatency.toFixed(2)),
      lossRate: Number(clusterLoss.toFixed(1)),
      status,
      dominantRole: roles[i % roles.length]
    });
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 2.1;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 3.8;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 5.2;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 8.4;

  const avgSubnetLoss = Number((totalLossAcc / clusters.length).toFixed(2));
  const utilizationPercent = Math.min(100, Math.round((simulatedTotalActive / Math.max(1, usableHosts)) * 100));

  return {
    cidr: `${longToIp(networkLong)}/${prefix}`,
    ipAddress: ipStr,
    prefixLength: prefix,
    netmask: longToIp(netmaskLong),
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsableIp: longToIp(firstUsableLong),
    lastUsableIp: longToIp(lastUsableLong),
    totalAddresses,
    usableHosts,
    binaryNetmask,
    ipClass,
    scope,
    hexSubnet,
    activeHosts: simulatedTotalActive,
    utilizationPercent,
    p50Latency: Number(p50.toFixed(2)),
    p90Latency: Number(p90.toFixed(2)),
    p95Latency: Number(p95.toFixed(2)),
    p99Latency: Number(p99.toFixed(2)),
    avgSubnetLoss,
    maxJitter: Number((p99 - p50).toFixed(2)),
    fragmentationRisk: prefix <= 22 ? 'LOW' : prefix === 30 ? 'MEDIUM' : 'LOW',
    pathMtu: 1500,
    clusters
  };
}

// Generate Realistic Enterprise MTR / Traceroute Path
export function generateTraceroutePath(
  target: string,
  scenario: 'healthy' | 'peering_congestion' | 'transatlantic_jump' | 'rate_limited_hop' | 'cloud_edge_loss' | 'severe_packet_loss' = 'healthy',
  cycle: number = 1
): DiagnosticSession {
  const isGoogle = target.includes('8.8.8.8') || target.includes('google');
  const isCloudflare = target.includes('1.1.1.1') || target.includes('cloudflare');
  const isAws = target.includes('aws') || target.includes('amazon') || target.includes('52.');
  const isInternal = target.startsWith('10.') || target.startsWith('192.168.') || target.startsWith('172.');

  let targetIp = target;
  if (isGoogle) targetIp = '8.8.8.8';
  else if (isCloudflare) targetIp = '1.1.1.1';
  else if (isAws) targetIp = '52.95.110.1';
  else if (!isInternal && !target.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    targetIp = '104.244.42.1';
  }

  // Base Hop Templates for Realistic Network Paths
  interface HopTemplate {
    ip: string;
    host: string;
    asn: string;
    asnOrg: string;
    city: string;
    country: string;
    countryCode: string;
    mplsLabel?: string;
    baseRtt: number;
    jitterRange: number;
    nodeType: HopDiagnostic['nodeType'];
    lossProfile: number;
    isRateLimited?: boolean;
  }

  let hopTemplates: HopTemplate[] = [];

  if (isInternal) {
    hopTemplates = [
      { ip: '10.200.1.1', host: 'gw-core01.internal.corp', asn: 'AS65001', asnOrg: 'Private Enterprise ASN', city: 'Dallas DC', country: 'United States', countryCode: 'US', baseRtt: 0.6, jitterRange: 0.2, nodeType: 'Edge', lossProfile: 0 },
      { ip: '10.200.4.12', host: 'sw-agg-leaf03.internal.corp', asn: 'AS65001', asnOrg: 'Private Enterprise ASN', city: 'Dallas DC', country: 'United States', countryCode: 'US', baseRtt: 1.1, jitterRange: 0.3, nodeType: 'Core', lossProfile: 0 },
      { ip: '10.200.8.50', host: 'fw-edge-ha.internal.corp', asn: 'AS65001', asnOrg: 'Private Enterprise ASN', city: 'Dallas DC', country: 'United States', countryCode: 'US', baseRtt: 1.8, jitterRange: 0.4, nodeType: 'Core', lossProfile: 0 },
      { ip: targetIp, host: `srv-target.${target}`, asn: 'AS65001', asnOrg: 'Private Enterprise ASN', city: 'Dallas DC', country: 'United States', countryCode: 'US', baseRtt: 2.3, jitterRange: 0.5, nodeType: 'Destination', lossProfile: 0 }
    ];
  } else if (scenario === 'transatlantic_jump') {
    hopTemplates = [
      { ip: '192.168.1.1', host: 'gateway.local-office.net', asn: 'AS64512', asnOrg: 'Enterprise HQ Branch', city: 'London', country: 'United Kingdom', countryCode: 'GB', baseRtt: 1.2, jitterRange: 0.4, nodeType: 'Edge', lossProfile: 0 },
      { ip: '195.66.224.78', host: 'linx-lon1.core.telehouse.net', asn: 'AS5459', asnOrg: 'LINX Internet Exchange', city: 'London', country: 'United Kingdom', countryCode: 'GB', baseRtt: 3.4, jitterRange: 0.8, nodeType: 'IXP', lossProfile: 0 },
      { ip: '213.155.130.12', host: 'ldn-b1-link.ip.arelion.net', asn: 'AS1299', asnOrg: 'Arelion / Telia Carrier', city: 'London', country: 'United Kingdom', countryCode: 'GB', baseRtt: 5.1, jitterRange: 1.0, nodeType: 'Transit', lossProfile: 0 },
      { ip: '62.115.112.44', host: 'subsea-tat14.ip.arelion.net', asn: 'AS1299', asnOrg: 'Arelion Subsea Cable', city: 'Bude Subsea Station', country: 'United Kingdom', countryCode: 'GB', mplsLabel: 'MPLS Exp:5 TTL:1 S:1 Label:24108', baseRtt: 18.2, jitterRange: 1.5, nodeType: 'MPLS', lossProfile: 0 },
      { ip: '62.115.120.89', host: 'ny-man-b2.ip.arelion.net', asn: 'AS1299', asnOrg: 'Arelion Subsea Transatlantic', city: 'New York', country: 'United States', countryCode: 'US', baseRtt: 78.6, jitterRange: 3.2, nodeType: 'Transit', lossProfile: 0 },
      { ip: '4.69.141.2', host: 'ae-2-3202.ear3.NewYork1.Level3.net', asn: 'AS3356', asnOrg: 'Lumen / Level 3', city: 'New York', country: 'United States', countryCode: 'US', baseRtt: 81.4, jitterRange: 2.8, nodeType: 'Transit', lossProfile: 0 },
      { ip: '142.250.228.18', host: 'google-ix-ny.google.com', asn: 'AS15169', asnOrg: 'Google LLC', city: 'New York', country: 'United States', countryCode: 'US', baseRtt: 82.8, jitterRange: 1.9, nodeType: 'Cloud Gateway', lossProfile: 0 },
      { ip: targetIp, host: isGoogle ? 'dns.google' : `edge.${target}`, asn: isGoogle ? 'AS15169' : 'AS13335', asnOrg: isGoogle ? 'Google LLC' : 'Cloudflare Inc', city: 'New York', country: 'United States', countryCode: 'US', baseRtt: 83.5, jitterRange: 1.4, nodeType: 'Destination', lossProfile: 0 }
    ];
  } else {
    // Default 8-hop enterprise transit path
    hopTemplates = [
      { ip: '10.100.0.1', host: 'edge-router-01.corp.lan', asn: 'AS65000', asnOrg: 'Internal SD-WAN Edge', city: 'Chicago', country: 'United States', countryCode: 'US', baseRtt: 0.8, jitterRange: 0.3, nodeType: 'Edge', lossProfile: 0 },
      { ip: '64.125.14.89', host: 'xe-0-1-0.edge01.ord02.zayo.com', asn: 'AS6461', asnOrg: 'Zayo Group LLC', city: 'Chicago', country: 'United States', countryCode: 'US', baseRtt: 4.2, jitterRange: 0.9, nodeType: 'Core', lossProfile: 0 },
      { ip: '129.250.4.11', host: 'ae-5.r21.chcgil09.us.bb.gin.ntt.net', asn: 'AS2914', asnOrg: 'NTT Communications', city: 'Chicago', country: 'United States', countryCode: 'US', mplsLabel: 'MPLS Exp:4 TTL:2 S:1 Label:104928', baseRtt: 6.8, jitterRange: 1.2, nodeType: 'Transit', lossProfile: 0 },
      { 
        ip: '129.250.2.80', 
        host: 'ae-1.r05.chcgil09.us.ce.gin.ntt.net', 
        asn: 'AS2914', 
        asnOrg: 'NTT Communications', 
        city: 'Chicago', 
        country: 'United States', 
        countryCode: 'US', 
        baseRtt: 8.9, 
        jitterRange: 1.5, 
        nodeType: 'Transit', 
        lossProfile: scenario === 'rate_limited_hop' ? 14.5 : 0, 
        isRateLimited: scenario === 'rate_limited_hop' 
      },
      { 
        ip: '206.108.255.45', 
        host: 'chicago-equinix-ix.net', 
        asn: 'AS24115', 
        asnOrg: 'Equinix Internet Exchange', 
        city: 'Chicago', 
        country: 'United States', 
        countryCode: 'US', 
        baseRtt: scenario === 'peering_congestion' ? 44.5 : 12.1, 
        jitterRange: scenario === 'peering_congestion' ? 16.8 : 2.1, 
        nodeType: 'IXP', 
        lossProfile: scenario === 'peering_congestion' ? 9.2 : 0 
      },
      { 
        ip: '142.250.169.32', 
        host: 'core2-chi.google.com', 
        asn: 'AS15169', 
        asnOrg: 'Google Global Infrastructure', 
        city: 'Council Bluffs', 
        country: 'United States', 
        countryCode: 'US', 
        baseRtt: scenario === 'peering_congestion' ? 48.2 : 16.4, 
        jitterRange: scenario === 'peering_congestion' ? 14.2 : 1.6, 
        nodeType: 'Transit', 
        lossProfile: scenario === 'peering_congestion' ? 9.0 : (scenario === 'severe_packet_loss' ? 17.5 : 0) 
      },
      { 
        ip: '108.170.248.65', 
        host: 'gw-ingress.cloud.google.com', 
        asn: 'AS15169', 
        asnOrg: 'Google Cloud VPC Gateway', 
        city: 'Council Bluffs', 
        country: 'United States', 
        countryCode: 'US', 
        baseRtt: scenario === 'peering_congestion' ? 51.0 : 19.8, 
        jitterRange: scenario === 'peering_congestion' ? 15.0 : 1.8, 
        nodeType: 'Cloud Gateway', 
        lossProfile: scenario === 'peering_congestion' ? 9.0 : (scenario === 'cloud_edge_loss' ? 12.0 : 0) 
      },
      { 
        ip: targetIp, 
        host: isGoogle ? 'dns.google' : isCloudflare ? 'one.one.one.one' : `target.${target}`, 
        asn: isGoogle ? 'AS15169' : isCloudflare ? 'AS13335' : 'AS16509', 
        asnOrg: isGoogle ? 'Google LLC' : isCloudflare ? 'Cloudflare Inc' : 'Amazon AWS', 
        city: 'Council Bluffs', 
        country: 'United States', 
        countryCode: 'US', 
        baseRtt: scenario === 'peering_congestion' ? 52.4 : 21.2, 
        jitterRange: scenario === 'peering_congestion' ? 15.4 : 1.2, 
        nodeType: 'Destination', 
        lossProfile: scenario === 'peering_congestion' ? 9.0 : (scenario === 'cloud_edge_loss' ? 12.0 : (scenario === 'severe_packet_loss' ? 18.0 : 0)) 
      }
    ];
  }

  // Simulate probe samples for each hop
  const sampleCount = Math.max(8, Math.min(30, 10 + cycle * 2));
  let prevAvgRtt = 0;

  const hops: HopDiagnostic[] = hopTemplates.map((tmpl, idx) => {
    const hopNum = idx + 1;
    const history: number[] = [];
    let sent = sampleCount;
    let recv = 0;

    for (let s = 0; s < sampleCount; s++) {
      // Simulate packet loss probability
      const shouldDrop = Math.random() * 100 < tmpl.lossProfile;
      if (shouldDrop) {
        // dropped
      } else {
        recv++;
        const sampleNoise = (Math.random() * 2 - 1) * tmpl.jitterRange;
        const rtt = Math.max(0.3, tmpl.baseRtt + sampleNoise);
        history.push(Number(rtt.toFixed(2)));
      }
    }

    const lossPercent = sent > 0 ? Number((((sent - recv) / sent) * 100).toFixed(1)) : 0;
    const avgRtt = history.length > 0 ? Number((history.reduce((a, b) => a + b, 0) / history.length).toFixed(2)) : 0;
    const bestRtt = history.length > 0 ? Number(Math.min(...history).toFixed(2)) : 0;
    const worstRtt = history.length > 0 ? Number(Math.max(...history).toFixed(2)) : 0;
    const lastRtt = history.length > 0 ? history[history.length - 1] : 0;
    const stdDevRtt = Number(calculateStdDev(history).toFixed(2));
    const jitter = Number(calculateJitter(history).toFixed(2));

    const degradationDelta = prevAvgRtt > 0 ? Number((avgRtt - prevAvgRtt).toFixed(2)) : 0;
    prevAvgRtt = avgRtt;

    let status: HopDiagnostic['status'] = 'optimal';
    let statusReason = 'Sub-millisecond jitter, optimal transit forwarding';

    if (tmpl.isRateLimited) {
      status = 'rate-limited';
      statusReason = 'ICMP Control Plane Rate-Limiting (CoPP / CPU thresholding) - No downstream impact';
    } else if (lossPercent > 10) {
      status = 'degraded';
      statusReason = `Critical sustained packet loss (${lossPercent}%) detected on forwarding plane`;
    } else if (lossPercent > 0 || jitter > 10) {
      status = 'warning';
      statusReason = `Elevated jitter (${jitter}ms) or packet drop (${lossPercent}%)`;
    } else if (degradationDelta > 30) {
      status = 'warning';
      statusReason = `Large latency step-up (+${degradationDelta}ms) - typical of subsea / inter-regional transit`;
    }

    return {
      hop: hopNum,
      ip: tmpl.ip,
      host: tmpl.host,
      asn: tmpl.asn,
      asnOrg: tmpl.asnOrg,
      city: tmpl.city,
      country: tmpl.country,
      countryCode: tmpl.countryCode,
      mplsLabel: tmpl.mplsLabel,
      sentCount: sent,
      recvCount: recv,
      lossPercent,
      lastRtt,
      avgRtt,
      bestRtt,
      worstRtt,
      stdDevRtt,
      jitter,
      mtu: 1500,
      nodeType: tmpl.nodeType,
      status,
      statusReason,
      rttHistory: history,
      degradationDelta
    };
  });

  const lastHop = hops[hops.length - 1];
  const overallAvgRtt = lastHop.avgRtt;
  const overallMinRtt = lastHop.bestRtt;
  const overallMaxRtt = lastHop.worstRtt;
  const overallJitter = lastHop.jitter;
  const overallLossPercent = lastHop.lossPercent;
  const mosScore = calculateMosScore(overallAvgRtt, overallJitter, overallLossPercent);

  let healthVerdict: DiagnosticSession['healthVerdict'] = 'EXCELLENT';
  if (overallLossPercent > 10 || mosScore < 3.2) healthVerdict = 'CRITICAL';
  else if (overallLossPercent > 1 || overallJitter > 12 || mosScore < 4.0) healthVerdict = 'DEGRADED';

  return {
    id: `diag-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    target,
    targetIp,
    probeCount: sampleCount,
    packetSize: 64,
    interval: 1000,
    dscp: 'CS0',
    hops,
    totalHops: hops.length,
    targetReached: lastHop.recvCount > 0,
    overallAvgRtt,
    overallMinRtt,
    overallMaxRtt,
    overallJitter,
    overallLossPercent,
    mosScore,
    healthVerdict,
    isLiveProbing: false,
    cycleCount: cycle
  };
}

// Generate Realistic Enterprise IP Range Scan
export function generateIpRangeScan(
  targetRange: string,
  selectedPorts: number[] = [22, 80, 443, 53, 3389, 161, 179]
): HostScanResult[] {
  let startIp = '10.0.4.1';
  let count = 24;

  if (targetRange.includes('/')) {
    const analysis = calculateSubnetAnalysis(targetRange);
    startIp = analysis.firstUsableIp;
    count = Math.min(64, analysis.usableHosts);
  } else if (targetRange.includes('-')) {
    const parts = targetRange.split('-').map(s => s.trim());
    startIp = parts[0];
    const endIp = parts[1];
    const sLong = ipToLong(startIp);
    const eLong = ipToLong(endIp);
    count = Math.min(64, Math.max(1, eLong - sLong + 1));
  }

  const startLong = ipToLong(startIp);
  const results: HostScanResult[] = [];

  const deviceProfiles = [
    { hostname: 'core-rt01', vendor: 'Cisco Systems (IOS-XE 17.9)', os: 'Cisco IOS-XE', openPorts: [22, 179, 161], rttBase: 0.8 },
    { hostname: 'dist-sw01', vendor: 'Arista Networks (EOS 4.28)', os: 'Arista EOS', openPorts: [22, 443, 161], rttBase: 1.2 },
    { hostname: 'sec-fw01', vendor: 'Palo Alto Networks (PAN-OS 11.0)', os: 'PAN-OS', openPorts: [443, 22], rttBase: 1.5 },
    { hostname: 'k8s-worker-01', vendor: 'Canonical Ubuntu 24.04 LTS', os: 'Linux 6.8 (Ubuntu)', openPorts: [22, 80, 443], rttBase: 2.1 },
    { hostname: 'k8s-worker-02', vendor: 'Canonical Ubuntu 24.04 LTS', os: 'Linux 6.8 (Ubuntu)', openPorts: [22, 80, 443], rttBase: 2.3 },
    { hostname: 'dc-activedir01', vendor: 'Microsoft Windows Server 2022', os: 'Windows Server 2022', openPorts: [53, 3389, 443], rttBase: 3.4 },
    { hostname: 'storage-san-01', vendor: 'Pure Storage FlashArray', os: 'Purity//FA 6.4', openPorts: [443, 22, 161], rttBase: 1.0 },
    { hostname: 'esxi-hypervisor01', vendor: 'VMware Inc.', os: 'VMware ESXi 8.0u2', openPorts: [443, 22], rttBase: 1.4 },
    { hostname: 'unassigned-host', vendor: 'Generic Device', os: 'Unknown', openPorts: [], rttBase: 999 }
  ];

  const serviceNames: Record<number, string> = {
    22: 'SSH (OpenSSH / CLI)',
    80: 'HTTP Web Server',
    443: 'HTTPS TLS Management',
    53: 'DNS (BIND9 / ActiveDir)',
    3389: 'RDP (Remote Desktop)',
    161: 'SNMPv3 Management',
    179: 'BGP Routing Daemon',
    4789: 'VXLAN Encapsulation',
    8080: 'HTTP Proxy / API'
  };

  for (let i = 0; i < count; i++) {
    const currentLong = startLong + i;
    const ip = longToIp(currentLong);
    const lastOctet = currentLong & 255;

    // Determine host presence and status
    const isOnline = lastOctet % 7 !== 0; // 6 out of 7 online
    const isHighLatency = lastOctet % 9 === 0;
    const isPacketLoss = lastOctet % 13 === 0;

    if (!isOnline) {
      results.push({
        ip,
        hostname: `host-${ip.replace(/\./g, '-')}.unassigned`,
        status: 'OFFLINE',
        rtt: 0,
        jitter: 0,
        packetLoss: 100,
        ttl: 0,
        osFingerprint: 'Unresponsive',
        deviceVendor: 'No Response / Filtered',
        openPorts: selectedPorts.map(p => ({
          port: p,
          service: serviceNames[p] || `Port ${p}`,
          status: 'closed' as const,
          protocol: 'TCP' as const
        })),
        services: [],
        lastProbeTime: new Date().toISOString()
      });
      continue;
    }

    const profile = deviceProfiles[i % deviceProfiles.length];
    let rtt = profile.rttBase + (Math.random() * 0.8 - 0.4);
    if (isHighLatency) rtt += 45.2;
    let packetLoss = isPacketLoss ? 12.5 : 0;
    let jitter = isHighLatency ? 14.2 : 0.6;

    let status: HostScanResult['status'] = 'ONLINE';
    if (packetLoss > 5) status = 'LOSS_WARNING';
    else if (rtt > 25) status = 'LATENCY_WARNING';

    const openPorts = selectedPorts.map(p => {
      const isOpen = profile.openPorts.includes(p);
      return {
        port: p,
        service: serviceNames[p] || `Port ${p}`,
        status: isOpen ? ('open' as const) : ('closed' as const),
        protocol: 'TCP' as const,
        banner: isOpen ? `${serviceNames[p]} [Ready]` : undefined
      };
    });

    const activeServices = openPorts.filter(p => p.status === 'open').map(p => p.service);

    results.push({
      ip,
      hostname: `${profile.hostname}-${ip.split('.').slice(2).join('-')}.corp`,
      status,
      rtt: Number(Math.max(0.4, rtt).toFixed(2)),
      jitter: Number(jitter.toFixed(2)),
      packetLoss,
      ttl: profile.os.includes('Linux') || profile.os.includes('Cisco') ? 64 : 128,
      osFingerprint: profile.os,
      deviceVendor: profile.vendor,
      macAddress: `00:50:56:${(i * 3 + 10).toString(16).padStart(2, '0')}:${(i * 7 + 20).toString(16).padStart(2, '0')}:${(lastOctet).toString(16).padStart(2, '0')}`.toUpperCase(),
      openPorts,
      services: activeServices,
      lastProbeTime: new Date().toISOString()
    });
  }

  return results;
}
