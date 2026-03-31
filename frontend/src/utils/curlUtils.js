/**
 * Robust cURL parser and generator for the Postman Mobile clone.
 */

export const parseCurl = (curlString) => {
  if (!curlString || !curlString.trim().startsWith('curl')) return null;

  const result = {
    method: 'GET',
    url: '',
    headers: [],
    body: '',
    bodyType: 'json',
  };

  // Improved regex to handle escaped quotes and different types of quotes
  // This is a simplified parser suitable for most web/API cURL commands
  const parts = [];
  let currentPart = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < curlString.length; i++) {
    const char = curlString[i];
    if ((char === '"' || char === "'") && (i === 0 || curlString[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      } else {
        currentPart += char;
      }
    } else if (char === ' ' && !inQuotes) {
      if (currentPart) {
        parts.push(currentPart);
        currentPart = '';
      }
    } else {
      currentPart += char;
    }
  }
  if (currentPart) parts.push(currentPart);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part === '-X' || part === '--request') {
      result.method = (parts[++i] || 'GET').toUpperCase();
    } else if (part === '-H' || part === '--header') {
      const headerStr = parts[++i];
      if (headerStr) {
        const colonIndex = headerStr.indexOf(':');
        if (colonIndex !== -1) {
          const key = headerStr.substring(0, colonIndex).trim();
          const value = headerStr.substring(colonIndex + 1).trim();
          result.headers.push({
            id: 'h-' + Math.random().toString(36).substr(2, 9),
            key,
            value,
            enabled: true
          });
        }
      }
    } else if (part === '-d' || part === '--data' || part === '--data-raw' || part === '--data-binary') {
      result.body = parts[++i] || '';
      // If method was default GET, change to POST because data is present
      if (result.method === 'GET') result.method = 'POST';
    } else if (part.startsWith('http')) {
      result.url = part;
    }
  }

  return result;
};

export const generateCurl = (request) => {
  const { method, url, headers, body } = request;
  
  let curl = `curl -X ${method} "${url}"`;

  if (headers && headers.length > 0) {
    headers.filter(h => h.enabled && h.key).forEach(h => {
      curl += ` \\\n  -H "${h.key}: ${h.value}"`;
    });
  }

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    // Escape single quotes for shell safety if needed, here we use double quotes
    const escapedBody = body.replace(/"/g, '\\"');
    curl += ` \\\n  -d "${escapedBody}"`;
  }

  return curl;
};
