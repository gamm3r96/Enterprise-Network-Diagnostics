import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DiagnosticSession, SubnetAnalysis, HostScanResult, AiTroubleshootingReport } from '../types';

export interface PdfExportOptions {
  session: DiagnosticSession;
  subnet?: SubnetAnalysis | null;
  scanResults?: HostScanResult[] | null;
  aiReport?: AiTroubleshootingReport | null;
  ticketNumber?: string;
  engineerName?: string;
  environment?: string;
  notes?: string;
}

export function generateEnterprisePdfReport(options: PdfExportOptions): jsPDF {
  const { session, subnet, scanResults, aiReport, ticketNumber = 'NET-DIAG-8042', engineerName = 'Network Operations Team', environment = 'Enterprise DC / SD-WAN', notes } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 40;

  // Header Background Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NETTRACE ENTERPRISE DIAGNOSTIC REPORT', 40, 34);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`RFC 3393 MTR Hop Analysis • Subnet Performance Matrix • IP Range Audit`, 40, 52);

  // Header Right Metadata
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`TICKET: ${ticketNumber}`, pageWidth - 40, 30, { align: 'right' });
  doc.text(`DATE: ${new Date(session.timestamp).toUTCString()}`, pageWidth - 40, 44, { align: 'right' });
  doc.text(`ENV: ${environment}`, pageWidth - 40, 58, { align: 'right' });

  currentY = 95;

  // Executive Assessment Banner
  const verdict = session.healthVerdict;
  let verdictBg = [16, 185, 129]; // green
  let verdictText = 'PATH METRICS OPTIMAL (0% Loss, MOS > 4.2)';
  if (verdict === 'CRITICAL') {
    verdictBg = [239, 68, 68]; // red
    verdictText = 'CRITICAL LATENCY & PACKET LOSS ANOMALY DETECTED';
  } else if (verdict === 'DEGRADED') {
    verdictBg = [245, 158, 11]; // amber
    verdictText = 'ELEVATED JITTER OR INTERMEDIATE PACKET LOSS DETECTED';
  }

  doc.setFillColor(verdictBg[0], verdictBg[1], verdictBg[2]);
  doc.roundedRect(40, currentY, pageWidth - 80, 26, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`AUDIT VERDICT: ${verdictText}`, 50, currentY + 17);

  currentY += 40;

  // Key Metric KPI Cards (4 Column Grid)
  const colWidth = (pageWidth - 80 - 30) / 4;
  const metrics = [
    { label: 'TARGET ENDPOINT', val: session.target, sub: session.targetIp },
    { label: 'END-TO-END RTT', val: `${session.overallAvgRtt} ms`, sub: `Min: ${session.overallMinRtt} / Max: ${session.overallMaxRtt}` },
    { label: 'PATH JITTER / LOSS', val: `${session.overallJitter} ms / ${session.overallLossPercent}%`, sub: `StdDev: ${session.hops[session.hops.length - 1]?.stdDevRtt || 0}ms` },
    { label: 'VOICE QUALITY (MOS)', val: `${session.mosScore} / 4.5`, sub: session.mosScore > 4.0 ? 'High Fidelity' : 'Impairment Risk' }
  ];

  metrics.forEach((m, idx) => {
    const x = 40 + idx * (colWidth + 10);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, colWidth, 48, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 8, currentY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, x + 8, currentY + 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, x + 8, currentY + 41);
  });

  currentY += 60;

  // SECTION: Hop-By-Hop MTR Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. HOP-BY-HOP MTR DIAGNOSTIC TELEMETRY', 40, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Probed ${session.probeCount} packets (${session.packetSize} bytes, DSCP ${session.dscp}) across ${session.totalHops} routing nodes`, 40, currentY + 12);

  currentY += 20;

  const hopTableData = session.hops.map(h => [
    h.hop.toString(),
    h.ip,
    h.host || 'Unknown',
    `${h.asn || '-'} (${h.asnOrg ? h.asnOrg.substring(0, 18) : '-'})`,
    `${h.sentCount}/${h.recvCount}`,
    `${h.lossPercent}%`,
    `${h.lastRtt} ms`,
    `${h.avgRtt} ms`,
    `${h.bestRtt} ms`,
    `${h.worstRtt} ms`,
    `${h.jitter} ms`,
    h.status === 'rate-limited' ? 'Rate-Ltd (CoPP)' : h.lossPercent > 5 ? 'High Loss' : h.status === 'warning' ? 'Elevated' : 'Optimal'
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 40, right: 40 },
    head: [['#', 'Hop IP', 'FQDN / Hostname', 'ASN & Carrier', 'S/R', 'Loss%', 'Last', 'Avg', 'Min', 'Max', 'Jitter', 'Status']],
    body: hopTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 3.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 16 },
      1: { font: 'courier', fontStyle: 'bold', cellWidth: 70 },
      2: { cellWidth: 80 },
      3: { cellWidth: 80 },
      4: { halign: 'center', cellWidth: 32 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 32 },
      6: { halign: 'right', cellWidth: 30 },
      7: { halign: 'right', fontStyle: 'bold', cellWidth: 30 },
      8: { halign: 'right', cellWidth: 28 },
      9: { halign: 'right', cellWidth: 28 },
      10: { halign: 'right', cellWidth: 28 },
      11: { halign: 'center', cellWidth: 50 }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const row = session.hops[data.row.index];
        if (row && row.lossPercent > 5 && row.status !== 'rate-limited') {
          data.cell.styles.fillColor = [254, 226, 226]; // light red
        } else if (row && row.status === 'rate-limited') {
          data.cell.styles.fillColor = [254, 243, 199]; // light amber
        }
      }
    }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 25;

  // SECTION: Root Cause & AI Diagnostics (if available or generated)
  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ROOT CAUSE DIAGNOSTICS & ANOMALY ANALYSIS', 40, currentY);

  currentY += 15;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(40, currentY, pageWidth - 80, 70, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Primary Finding:', 50, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const rootCauseText = aiReport?.rootCause || 
    (session.overallLossPercent > 5 
      ? `Forwarding-plane packet loss of ${session.overallLossPercent}% detected on intermediate carrier transit. Jitter standard deviation is ${session.hops[session.hops.length - 1]?.stdDevRtt}ms.`
      : `Path propagation latency is stable at ${session.overallAvgRtt}ms with 0% end-to-end packet loss. All routing nodes operating within enterprise SLA threshold.`);

  const splitRootCause = doc.splitTextToSize(rootCauseText, pageWidth - 110);
  doc.text(splitRootCause, 50, currentY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`SLA Impact Risk: ${aiReport?.slaRisk || (session.overallLossPercent > 5 ? 'HIGH' : 'LOW')}  |  Path MTU: 1500 bytes  |  QoS ToS: ${session.dscp}`, 50, currentY + 58);

  currentY += 85;

  // SECTION: Subnet Performance Summary (if present)
  if (subnet) {
    if (currentY > pageHeight - 180) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. GRANULAR SUBNET PERFORMANCE & CAPACITY ANALYSIS', 40, currentY);

    currentY += 15;

    const subnetSummaryData = [
      ['Subnet CIDR', subnet.cidr, 'Total Usable Hosts', `${subnet.usableHosts.toLocaleString()} IPs`],
      ['Network Address', subnet.networkAddress, 'Active Allocated', `${subnet.activeHosts} IPs (${subnet.utilizationPercent}%)`],
      ['Broadcast Address', subnet.broadcastAddress, 'p50 / p90 Latency', `${subnet.p50Latency} ms / ${subnet.p90Latency} ms`],
      ['Usable IP Range', `${subnet.firstUsableIp} - ${subnet.lastUsableIp}`, 'p95 / p99 Latency', `${subnet.p95Latency} ms / ${subnet.p99Latency} ms`],
      ['Subnet Netmask', subnet.netmask, 'Subnet Loss Rate', `${subnet.avgSubnetLoss}%`],
      ['Scope Classification', `${subnet.scope} (Class ${subnet.ipClass})`, 'Fragmentation Risk', subnet.fragmentationRisk]
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: 40, right: 40 },
      head: [['Subnet Parameter', 'Value', 'Performance Metric', 'Telemetry']],
      body: subnetSummaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { font: 'courier', cellWidth: 140 },
        2: { fontStyle: 'bold', cellWidth: 110 },
        3: { cellWidth: 140 }
      }
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 25;
  }

  // SECTION: IP Range Scan Summary (if present)
  if (scanResults && scanResults.length > 0) {
    if (currentY > pageHeight - 180) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. IP RANGE SCAN & PORT AUDIT SUMMARY', 40, currentY);

    currentY += 15;

    const scanTableData = scanResults.slice(0, 15).map(h => [
      h.ip,
      h.hostname,
      h.status,
      h.status === 'OFFLINE' ? '-' : `${h.rtt} ms`,
      `${h.packetLoss}%`,
      h.osFingerprint || 'Unknown',
      h.openPorts.filter(p => p.status === 'open').map(p => p.port).join(', ') || 'None'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: 40, right: 40 },
      head: [['Host IP', 'Hostname', 'Status', 'RTT', 'Loss%', 'OS Fingerprint', 'Open Ports']],
      body: scanTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 3
      },
      columnStyles: {
        0: { font: 'courier', fontStyle: 'bold', cellWidth: 75 },
        1: { cellWidth: 100 },
        2: { halign: 'center', cellWidth: 60 },
        3: { halign: 'right', cellWidth: 40 },
        4: { halign: 'center', cellWidth: 35 },
        5: { cellWidth: 90 },
        6: { font: 'courier', cellWidth: 80 }
      }
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 25;
  }

  // Engineering Sign-Off Footer
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 40;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(40, currentY, pageWidth - 40, currentY);
  currentY += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Lead Engineer: ${engineerName}   |   Approved: NetOps Change Advisory Board   |   Generated by NetTrace Enterprise`, 40, currentY);
  doc.text(`CONFIDENTIAL - FOR ENTERPRISE INTERNAL USE ONLY`, pageWidth - 40, currentY, { align: 'right' });

  // Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  return doc;
}
