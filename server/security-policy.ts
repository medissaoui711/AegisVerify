// Zero-dependency native IPv4 validator compatible with Edge/Cloudflare Workers and Node.js
function isIPv4(host: string): boolean {
  if (typeof host !== 'string') return false;
  const parts = host.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
}

export interface SsrfCheckResult {
  isBlocked: boolean;
  reason?: string;
  reasonAr?: string;
  blockedTarget?: string;
}

// Blocked private, loopback, link-local, carrier-grade NAT, and cloud metadata subnets
const PRIVATE_IP_RANGES = [
  { start: '127.0.0.0', end: '127.255.255.255', desc: 'Loopback (127.0.0.0/8)' },
  { start: '10.0.0.0', end: '10.255.255.255', desc: 'Private Class A (10.0.0.0/8)' },
  { start: '172.16.0.0', end: '172.31.255.255', desc: 'Private Class B (172.16.0.0/12)' },
  { start: '192.168.0.0', end: '192.168.255.255', desc: 'Private Class C (192.168.0.0/16)' },
  { start: '169.254.0.0', end: '169.254.255.255', desc: 'Link-Local & Cloud Metadata (169.254.0.0/16)' },
  { start: '100.64.0.0', end: '100.127.255.255', desc: 'Carrier-Grade NAT (100.64.0.0/10)' },
  { start: '0.0.0.0', end: '0.255.255.255', desc: 'Current network (0.0.0.0/8)' },
  { start: '224.0.0.0', end: '239.255.255.255', desc: 'Multicast (224.0.0.0/4)' },
  { start: '240.0.0.0', end: '255.255.255.255', desc: 'Reserved/Future (240.0.0.0/4)' },
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
  '169.254.169.254',
  '100.100.100.200', // Alibaba Cloud Metadata
  'vault.internal',
  'consul.internal',
  'kubernetes.default',
  'kubernetes.default.svc',
  'kubernetes.default.svc.cluster.local',
]);

const BLOCKED_DOMAINS_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.home',
  '.corp',
  '.intra',
  '.onion',
  '.test',
  '.example',
  '.invalid',
  '.localhost',
  '.arpa',
];

// Well-known public wildcard DNS rebinding / loopback reflector domains
const WILDCARD_LOOPBACK_DOMAINS = [
  'nip.io',
  'sslip.io',
  'lvh.me',
  'localtest.me',
  'vcap.me',
  'lacolhost.com',
  '127.0.0.1.nip.io',
];

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIpInSubnet(ip: string, start: string, end: string): boolean {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(start);
  const endNum = ipToNumber(end);
  return ipNum >= startNum && ipNum <= endNum;
}

// Parses numeric/shorthand IPv4 notations like 127.1, 0177.0.0.1, 0x7f000001, 2130706433
function tryParseAlternativeIpv4(host: string): string | null {
  // Hexadecimal single integer (0x7f000001)
  if (/^0x[0-9a-fA-F]{1,8}$/i.test(host)) {
    const num = parseInt(host, 16);
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join('.');
  }

  // Decimal 32-bit integer (e.g. 2130706433)
  if (/^\d{8,11}$/.test(host)) {
    const num = parseInt(host, 10);
    if (num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
    }
  }

  // Shorthand octets: 127.1 -> 127.0.0.1, 10.1 -> 10.0.0.1
  const parts = host.split('.');
  if (parts.length >= 2 && parts.length <= 4) {
    const parsedParts: number[] = [];
    let isAlternative = false;

    for (const p of parts) {
      if (/^0x[0-9a-fA-F]+$/i.test(p)) {
        parsedParts.push(parseInt(p, 16));
        isAlternative = true;
      } else if (/^0[0-7]+$/.test(p)) {
        parsedParts.push(parseInt(p, 8));
        isAlternative = true;
      } else if (/^\d+$/.test(p)) {
        parsedParts.push(parseInt(p, 10));
      } else {
        return null;
      }
    }

    if (parsedParts.length === 2) {
      // a.b -> a.0.0.b
      return `${parsedParts[0]}.0.0.${parsedParts[1]}`;
    }
    if (parsedParts.length === 3) {
      // a.b.c -> a.b.0.c
      return `${parsedParts[0]}.${parsedParts[1]}.0.${parsedParts[2]}`;
    }
    if (parsedParts.length === 4 && isAlternative) {
      return parsedParts.join('.');
    }
  }

  return null;
}

export function validateSsrfAndAbuse(inputUrlOrHost: string): SsrfCheckResult {
  let raw = inputUrlOrHost.trim();

  // 0. URL-Decode to catch encoded bypasses (e.g., %31%32%37%2e%30%2e%30%2e%31)
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Keep raw
  }

  let hostname = raw.toLowerCase();

  try {
    if (hostname.includes('://')) {
      const parsed = new URL(hostname);
      hostname = parsed.hostname.toLowerCase();
    } else if (hostname.includes('/')) {
      hostname = hostname.split('/')[0].toLowerCase();
    }

    // Strip UserInfo (e.g., user:pass@hostname)
    if (hostname.includes('@')) {
      hostname = hostname.split('@').pop() || hostname;
    }

    // Remove port if present (handling IPv6 brackets)
    if (hostname.startsWith('[') && hostname.includes(']')) {
      hostname = hostname.substring(1, hostname.indexOf(']'));
    } else if (hostname.includes(':') && !hostname.includes('::')) {
      hostname = hostname.split(':')[0];
    }
  } catch {
    // If URL parsing throws, fall back to basic cleanup
  }

  hostname = hostname.trim();

  // 1. Direct match with blocked metadata / loopback hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      isBlocked: true,
      blockedTarget: hostname,
      reason: `Blocked request to protected/internal host (${hostname}). SSRF prevention policy enforced.`,
      reasonAr: `تم حظر الطلب الموجه لنطاق داخلي محمي (${hostname}) لمنع هجمات تزوير الطلبات بالخادم (SSRF).`,
    };
  }

  // 2. Check suffix match (.local, .internal, .lan, .onion)
  for (const suffix of BLOCKED_DOMAINS_SUFFIXES) {
    if (hostname.endsWith(suffix) || hostname === suffix.replace('.', '')) {
      return {
        isBlocked: true,
        blockedTarget: hostname,
        reason: `Blocked non-routable top-level domain (${suffix}). Internal network probing prohibited.`,
        reasonAr: `تم حظر النطاق غير القابل للتوجيه (${suffix}) لمنع استكشاف الشبكات الداخلية.`,
      };
    }
  }

  // 3. Check Wildcard DNS Rebinding Services (e.g., 127.0.0.1.nip.io, *.sslip.io)
  for (const wildcard of WILDCARD_LOOPBACK_DOMAINS) {
    if (hostname === wildcard || hostname.endsWith('.' + wildcard)) {
      // If it contains loopback or private IP within the subdomain
      const ipInSubdomain = hostname.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipInSubdomain) {
        const extractedIp = ipInSubdomain[1];
        if (isIPv4(extractedIp)) {
          for (const range of PRIVATE_IP_RANGES) {
            if (isIpInSubnet(extractedIp, range.start, range.end)) {
              return {
                isBlocked: true,
                blockedTarget: hostname,
                reason: `Blocked DNS Rebinding / Wildcard reflector (${hostname} -> ${extractedIp} in ${range.desc}).`,
                reasonAr: `تم حظر استغلال خدمة التوجيه الديناميكي (DNS Rebinding) (${hostname}) التي تشير إلى شبكة داخلية.`,
              };
            }
          }
        }
      }

      // If generic local domain like lvh.me / localtest.me
      if (['lvh.me', 'localtest.me', 'vcap.me', 'lacolhost.com'].includes(wildcard) || hostname.endsWith(wildcard)) {
        return {
          isBlocked: true,
          blockedTarget: hostname,
          reason: `Blocked local development reflector domain (${hostname}).`,
          reasonAr: `تم حظر نطاق التطوير المحلي (${hostname}).`,
        };
      }
    }
  }

  // 4. IPv6 Loopback, Link-Local & IPv4-Mapped IPv6
  const cleanIpv6 = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    cleanIpv6 === '::1' ||
    cleanIpv6 === '0:0:0:0:0:0:0:1' ||
    cleanIpv6 === '::' ||
    cleanIpv6 === '0:0:0:0:0:0:0:0' ||
    cleanIpv6.startsWith('fe80:') || // Link-local
    cleanIpv6.startsWith('fc00:') || // Unique local
    cleanIpv6.startsWith('fd00:') ||
    cleanIpv6.startsWith('::ffff:') // IPv4-mapped IPv6
  ) {
    if (cleanIpv6.startsWith('::ffff:')) {
      const mappedIp = cleanIpv6.replace('::ffff:', '');
      if (isIPv4(mappedIp)) {
        for (const range of PRIVATE_IP_RANGES) {
          if (isIpInSubnet(mappedIp, range.start, range.end)) {
            return {
              isBlocked: true,
              blockedTarget: hostname,
              reason: `Blocked IPv4-mapped IPv6 (${hostname}) resolving to ${range.desc}.`,
              reasonAr: `تم حظر عنوان IPv4-mapped IPv6 (${hostname}) لوقوعه في شبكة داخلية محظورة.`,
            };
          }
        }
      }
    }

    return {
      isBlocked: true,
      blockedTarget: hostname,
      reason: `Blocked IPv6 private/link-local/loopback address (${hostname}).`,
      reasonAr: `تم حظر عنوان IPv6 الداخلي المحمي (${hostname}).`,
    };
  }

  // 5. Standard IPv4 Private subnet check
  if (isIPv4(hostname)) {
    for (const range of PRIVATE_IP_RANGES) {
      if (isIpInSubnet(hostname, range.start, range.end)) {
        return {
          isBlocked: true,
          blockedTarget: hostname,
          reason: `Blocked private/loopback IP address (${hostname}) falling in ${range.desc}.`,
          reasonAr: `تم حظر عنوان IP الداخلي (${hostname}) لوقوعه ضمن النطاق الخاص (${range.desc}).`,
        };
      }
    }
  }

  // 6. Alternative IP notations: Hex, Decimal DWORD, Octal, Shorthand (e.g. 127.1, 2130706433, 0x7f000001)
  const altIp = tryParseAlternativeIpv4(hostname);
  if (altIp && isIPv4(altIp)) {
    for (const range of PRIVATE_IP_RANGES) {
      if (isIpInSubnet(altIp, range.start, range.end)) {
        return {
          isBlocked: true,
          blockedTarget: hostname,
          reason: `Blocked obfuscated IP notation (${hostname} -> ${altIp}) resolving to ${range.desc}.`,
          reasonAr: `تم حظر تمثيل IP المموه (${hostname} -> ${altIp}) العائد إلى (${range.desc}).`,
        };
      }
    }
  }

  return { isBlocked: false };
}
