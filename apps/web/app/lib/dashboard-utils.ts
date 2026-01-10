export function formatTime(now: Date, locale: string) {
  return now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatDate(now: Date, locale: string) {
  return now.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

export function splitUrl(raw: string) {
  if (!raw) {
    return { protocol: 'http', rest: '' };
  }

  const trimmed = raw.trim();
  const match = trimmed.match(
    /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/
  );
  if (match) {
    return { protocol: match[1].toLowerCase(), rest: match[2] };
  }
  return { protocol: 'http', rest: trimmed };
}

export function buildUrl(protocol: string, rest: string) {
  const normalizedProtocol = protocol === 'https' ? 'https' : 'http';
  const trimmed = rest
    .trim()
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/{2}/, '');
  if (!trimmed) {
    return `${normalizedProtocol}://`;
  }
  return `${normalizedProtocol}://${trimmed}`;
}

export function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
