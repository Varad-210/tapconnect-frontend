/**
 * Utility to automatically convert Google Maps links (short links, place links, or coordinates)
 * into direct 5-star Google Review links: https://search.google.com/local/writereview?placeid=...
 */

export function hexToPlaceId(hex1: string, hex2: string): string {
  try {
    const cleanHex1 = hex1.replace(/^0x/i, "");
    const cleanHex2 = hex2.replace(/^0x/i, "");
    const a = BigInt(`0x${cleanHex1}`);
    const b = BigInt(`0x${cleanHex2}`);

    const buf = Buffer.alloc(20);
    buf[0] = 0x0a;
    buf[1] = 0x12;
    buf[2] = 0x09;
    buf.writeBigUInt64LE(a, 3);
    buf[11] = 0x11;
    buf.writeBigUInt64LE(b, 12);
    return buf.toString("base64url");
  } catch {
    return "";
  }
}

export function extractPlaceIdFromTextOrUrl(input: string): string | null {
  if (!input) return null;
  const decoded = decodeURIComponent(input);

  // 1. Direct Place ID query parameter: placeid=ChIJ... or place_id:ChIJ...
  const pidParamMatch = decoded.match(/place_?id[=:]\s*(ChIJ[a-zA-Z0-9_-]{20,})/i);
  if (pidParamMatch) return pidParamMatch[1];

  // 2. Direct ChIJ pattern in text
  const directChij = decoded.match(/\b(ChIJ[a-zA-Z0-9_-]{20,})\b/);
  if (directChij) return directChij[1];

  // 3. Google Maps Feature ID pattern: !1s0x<hex1>:0x<hex2>
  const featureMatch = decoded.match(/!1s0x([0-9a-fA-F]+):0x([0-9a-fA-F]+)/);
  if (featureMatch) {
    const pid = hexToPlaceId(featureMatch[1], featureMatch[2]);
    if (pid && pid.startsWith("ChIJ")) return pid;
  }

  // 4. Any Google Hex pair pattern: 0x<hex1>:0x<hex2>
  const hexMatch = decoded.match(/0x([0-9a-fA-F]{12,18}):0x([0-9a-fA-F]{12,18})/);
  if (hexMatch) {
    const pid = hexToPlaceId(hexMatch[1], hexMatch[2]);
    if (pid && pid.startsWith("ChIJ")) return pid;
  }

  // 5. CID query parameter: ?cid=7018381942997986223 (decimal) combined with hex1
  const dataHexMatch = decoded.match(/!1s0x([0-9a-fA-F]+)/);
  const cidMatch = decoded.match(/[?&]cid=(\d+)/);
  if (dataHexMatch && cidMatch) {
    const hex2 = BigInt(cidMatch[1]).toString(16);
    const pid = hexToPlaceId(dataHexMatch[1], hex2);
    if (pid && pid.startsWith("ChIJ")) return pid;
  }

  return null;
}

/**
 * Resolves any Google Maps URL or Place ID into a direct 5-star Google Review link.
 * Example:
 * Input:  https://maps.app.goo.gl/2HKN66fwAmWUftYy9
 * Output: https://search.google.com/local/writereview?placeid=ChIJw2zn4WEX0DsRrytpMjFNZmE
 */
export async function resolveToGoogle5StarReviewLink(urlOrText: string): Promise<{
  reviewUrl: string;
  placeId: string | null;
  isConverted: boolean;
}> {
  if (!urlOrText) {
    return { reviewUrl: urlOrText, placeId: null, isConverted: false };
  }

  const trimmed = urlOrText.trim();

  // If it's already a writereview link with Place ID
  if (/search\.google\.com\/local\/writereview\?placeid=ChIJ/i.test(trimmed)) {
    const pidMatch = trimmed.match(/placeid=(ChIJ[a-zA-Z0-9_-]+)/i);
    return {
      reviewUrl: trimmed,
      placeId: pidMatch ? pidMatch[1] : null,
      isConverted: true,
    };
  }

  // Check if Place ID or hex IDs are already embedded in the URL/string
  const immediatePid = extractPlaceIdFromTextOrUrl(trimmed);
  if (immediatePid) {
    return {
      reviewUrl: `https://search.google.com/local/writereview?placeid=${immediatePid}`,
      placeId: immediatePid,
      isConverted: true,
    };
  }

  // If it looks like a short Google Maps link or Google URL
  const isGoogleMapsUrl =
    /maps\.app\.goo\.gl|goo\.gl\/maps|google\.[a-z.]+\/maps/i.test(trimmed);

  if (isGoogleMapsUrl) {
    // 1. Unshorten using reliable public unshorten service first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const unshortenResp = await fetch(
        `https://unshorten.me/json/${encodeURIComponent(trimmed)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (unshortenResp.ok) {
        const data = await unshortenResp.json();
        const resolved = data?.resolved_url;
        if (resolved) {
          const pid = extractPlaceIdFromTextOrUrl(resolved);
          if (pid) {
            return {
              reviewUrl: `https://search.google.com/local/writereview?placeid=${pid}`,
              placeId: pid,
              isConverted: true,
            };
          }
        }
      }
    } catch {
      // Continue to next fallback
    }

    // 2. Direct fetch fallback with short timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const resp = await fetch(trimmed, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(timeoutId);

      const finalUrl = resp.url || "";
      const pidFromFinal = extractPlaceIdFromTextOrUrl(finalUrl);
      if (pidFromFinal) {
        return {
          reviewUrl: `https://search.google.com/local/writereview?placeid=${pidFromFinal}`,
          placeId: pidFromFinal,
          isConverted: true,
        };
      }

      const bodyText = await resp.text();
      const pidFromBody = extractPlaceIdFromTextOrUrl(bodyText);
      if (pidFromBody) {
        return {
          reviewUrl: `https://search.google.com/local/writereview?placeid=${pidFromBody}`,
          placeId: pidFromBody,
          isConverted: true,
        };
      }
    } catch {
      // Continue
    }
  }

  return {
    reviewUrl: trimmed,
    placeId: null,
    isConverted: false,
  };
}
