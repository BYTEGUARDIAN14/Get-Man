export function parseScannedText(text) {
  if (!text) return { url: '', method: 'GET', params: [] };
  const urlRegex = /(https?:\/\/|wss?:\/\/)[^\s"'<>]+/i;
  const methodRegex = /\b(GET|POST|PUT|PATCH|DELETE)\b/i;
  const urlMatch = text.match(urlRegex);
  const methodMatch = text.match(methodRegex);
  let url = urlMatch ? urlMatch[0] : '';
  const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
  const params = [];
  if (url) {
    const qIndex = url.indexOf('?');
    if (qIndex !== -1) {
      const queryString = url.substring(qIndex + 1);
      url = url.substring(0, qIndex);
      queryString.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key) params.push({ key: decodeURIComponent(key), value: decodeURIComponent(value || ''), enabled: true, id: Date.now().toString() + Math.random() });
      });
    }
  }
  return { url, method, params };
}
