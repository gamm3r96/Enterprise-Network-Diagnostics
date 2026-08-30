import { HopDiagnostic } from '../types';

export interface GeoIpInfo {
  ip: string;
  asn: string;
  asnOrg: string;
  isp: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isPrivate: boolean;
  ipType?: 'Public Unicast' | 'Anycast CDN' | 'Tier-1 Backbone' | 'Cloud Edge' | 'Private RFC1918' | 'Loopback' | 'Carrier-Grade NAT';
}

// Convert ISO 3166-1 alpha-2 country code to Flag Emoji
export function getCountryFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode === 'LAN' || countryCode === 'PRIVATE' || countryCode === 'UN' || countryCode === 'LOCAL') {
    return '🏠';
  }
  const code = countryCode.toUpperCase().trim();
  if (code.length !== 2) return '🌐';
  
  // Calculate regional indicator symbols
  const codePoints = [...code].map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Check if IP is private / local / reserved
export function isPrivateIp(ip: string): boolean {
  if (!ip || ip === '*' || ip === '127.0.0.1' || ip === 'localhost') return true;
  
  const clean = ip.trim();
  if (clean.startsWith('10.') || clean.startsWith('192.168.')) return true;
  if (clean.startsWith('127.')) return true;
  if (clean.startsWith('169.254.')) return true; // Link-local
  if (clean.startsWith('100.64.')) return true; // CGNAT RFC 6598

  if (clean.startsWith('172.')) {
    const parts = clean.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (!isNaN(secondOctet) && secondOctet >= 16 && secondOctet <= 31) {
        return true;
      }
    }
  }

  // IPv6 Unique Local / Loopback
  if (clean === '::1' || clean.startsWith('fc00:') || clean.startsWith('fd00:') || clean.startsWith('fe80:')) {
    return true;
  }

  return false;
}

// In-memory client cache
const clientGeoCache = new Map<string, GeoIpInfo>();

// Known Carrier & Cloud Provider Presets for instantaneous lookups
const KNOWN_PROVIDERS: Record<string, Partial<GeoIpInfo>> = {
  '8.8.8.8': { asn: 'AS15169', asnOrg: 'Google LLC', isp: 'Google Public DNS', city: 'Mountain View', region: 'California', country: 'United States', countryCode: 'US', latitude: 37.422, longitude: -122.084, timezone: 'America/Los_Angeles', ipType: 'Anycast CDN' },
  '8.8.4.4': { asn: 'AS15169', asnOrg: 'Google LLC', isp: 'Google Public DNS', city: 'Mountain View', region: 'California', country: 'United States', countryCode: 'US', latitude: 37.422, longitude: -122.084, timezone: 'America/Los_Angeles', ipType: 'Anycast CDN' },
  '1.1.1.1': { asn: 'AS13335', asnOrg: 'Cloudflare, Inc.', isp: 'Cloudflare Anycast DNS', city: 'San Francisco', region: 'California', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles', ipType: 'Anycast CDN' },
  '1.0.0.1': { asn: 'AS13335', asnOrg: 'Cloudflare, Inc.', isp: 'Cloudflare Anycast DNS', city: 'San Francisco', region: 'California', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles', ipType: 'Anycast CDN' },
  '9.9.9.9': { asn: 'AS19281', asnOrg: 'Quad9 Security', isp: 'Quad9 Recursive Resolver', city: 'Zurich', region: 'Zurich', country: 'Switzerland', countryCode: 'CH', latitude: 47.3769, longitude: 8.5417, timezone: 'Europe/Zurich', ipType: 'Anycast CDN' },
  '208.67.222.222': { asn: 'AS36692', asnOrg: 'Cisco Systems', isp: 'Cisco OpenDNS', city: 'San Francisco', region: 'California', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles', ipType: 'Anycast CDN' },
  '4.2.2.2': { asn: 'AS3356', asnOrg: 'Lumen Technologies', isp: 'Level3 / CenturyLink Backbone', city: 'Broomfield', region: 'Colorado', country: 'United States', countryCode: 'US', latitude: 39.9205, longitude: -105.0867, timezone: 'America/Denver', ipType: 'Tier-1 Backbone' }
};

// Fetch Geo-IP Information for a single IP address
export async function fetchIpGeoDetails(ip: string): Promise<GeoIpInfo> {
  const cleanIp = ip.trim();

  // If local / private
  if (isPrivateIp(cleanIp)) {
    let type: GeoIpInfo['ipType'] = 'Private RFC1918';
    if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') type = 'Loopback';
    else if (cleanIp.startsWith('100.64.')) type = 'Carrier-Grade NAT';

    const info: GeoIpInfo = {
      ip: cleanIp,
      asn: 'AS64512',
      asnOrg: 'Private Enterprise Intranet',
      isp: 'Internal Enterprise LAN / Gateway',
      city: 'Local Subnet',
      region: 'Internal Intranet',
      country: 'Private Network',
      countryCode: 'LAN',
      isPrivate: true,
      ipType: type
    };
    clientGeoCache.set(cleanIp, info);
    return info;
  }

  // Check cache
  if (clientGeoCache.has(cleanIp)) {
    return clientGeoCache.get(cleanIp)!;
  }

  // Check Known Static Providers
  if (KNOWN_PROVIDERS[cleanIp]) {
    const known = {
      ip: cleanIp,
      asn: KNOWN_PROVIDERS[cleanIp].asn || 'AS-Transit',
      asnOrg: KNOWN_PROVIDERS[cleanIp].asnOrg || 'Enterprise Backbone',
      isp: KNOWN_PROVIDERS[cleanIp].isp || KNOWN_PROVIDERS[cleanIp].asnOrg || 'Global ISP',
      city: KNOWN_PROVIDERS[cleanIp].city || 'Edge Gateway',
      region: KNOWN_PROVIDERS[cleanIp].region || 'Global',
      country: KNOWN_PROVIDERS[cleanIp].country || 'United States',
      countryCode: KNOWN_PROVIDERS[cleanIp].countryCode || 'US',
      latitude: KNOWN_PROVIDERS[cleanIp].latitude,
      longitude: KNOWN_PROVIDERS[cleanIp].longitude,
      timezone: KNOWN_PROVIDERS[cleanIp].timezone,
      isPrivate: false,
      ipType: KNOWN_PROVIDERS[cleanIp].ipType || 'Public Unicast'
    };
    clientGeoCache.set(cleanIp, known);
    return known;
  }

  // 1. Try Backend Proxy API first
  try {
    const res = await fetch('/api/network/geoip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: cleanIp })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        const geoInfo: GeoIpInfo = {
          ip: cleanIp,
          asn: data.asn || 'AS-Transit',
          asnOrg: data.asnOrg || data.org || 'Global Transit Provider',
          isp: data.isp || data.asnOrg || data.org || 'Tier-1 Carrier',
          city: data.city || 'Regional POP',
          region: data.region || '',
          country: data.country || 'Global Transit',
          countryCode: data.countryCode || 'GL',
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          isPrivate: false,
          ipType: data.ipType || (data.asn?.includes('13335') || data.asn?.includes('15169') ? 'Anycast CDN' : 'Public Unicast')
        };
        clientGeoCache.set(cleanIp, geoInfo);
        return geoInfo;
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Direct client-side public API fallback (ipwho.is with CORS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`https://ipwho.is/${cleanIp}`, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        const geoInfo: GeoIpInfo = {
          ip: cleanIp,
          asn: data.connection?.asn ? `AS${data.connection.asn}` : 'AS-Transit',
          asnOrg: data.connection?.org || data.connection?.isp || 'Global Network Carrier',
          isp: data.connection?.isp || data.connection?.org || 'Internet Service Provider',
          city: data.city || 'Edge Gateway',
          region: data.region || data.region_code || '',
          country: data.country || 'Global',
          countryCode: data.country_code || 'UN',
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone?.id || data.timezone?.abbr,
          isPrivate: false,
          ipType: 'Public Unicast'
        };
        clientGeoCache.set(cleanIp, geoInfo);
        return geoInfo;
      }
    }
  } catch {
    // Handled in default fallback
  }

  // 3. Fallback Heuristic
  const fallbackInfo: GeoIpInfo = {
    ip: cleanIp,
    asn: 'AS-Transit',
    asnOrg: 'Tier-1 Backbone Transit',
    isp: 'Global Internet Carrier',
    city: 'Transit Exchange',
    region: 'Backbone',
    country: 'International',
    countryCode: 'GL',
    isPrivate: false,
    ipType: 'Tier-1 Backbone'
  };
  clientGeoCache.set(cleanIp, fallbackInfo);
  return fallbackInfo;
}

// Batch enrich traceroute hops with Geo-IP data
export async function enrichHopsWithGeoIp(hops: HopDiagnostic[]): Promise<HopDiagnostic[]> {
  const enriched = await Promise.all(
    hops.map(async (hop) => {
      // If already has enriched city and country, retain or refresh
      if (hop.ip === '*' || !hop.ip) return hop;

      try {
        const geo = await fetchIpGeoDetails(hop.ip);
        return {
          ...hop,
          asn: geo.asn || hop.asn || 'AS-Transit',
          asnOrg: geo.asnOrg || hop.asnOrg || 'Enterprise Backbone',
          city: geo.city || hop.city,
          country: geo.country || hop.country,
          countryCode: geo.countryCode || hop.countryCode,
          isp: geo.isp || hop.asnOrg,
          region: geo.region,
          latitude: geo.latitude,
          longitude: geo.longitude,
          timezone: geo.timezone,
          isPrivate: geo.isPrivate
        };
      } catch {
        return hop;
      }
    })
  );

  return enriched;
}
