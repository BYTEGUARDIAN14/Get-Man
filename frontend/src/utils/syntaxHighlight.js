export function tokenizeJSON(input) {
  const s = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
  if (!s) return [{ type: 'punctuation', value: '' }];
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    if (/\s/.test(s[i])) {
      let ws = '';
      while (i < s.length && /\s/.test(s[i])) { ws += s[i]; i++; }
      tokens.push({ type: 'whitespace', value: ws });
      continue;
    }
    if ('{}[],:'.includes(s[i])) {
      tokens.push({ type: 'punctuation', value: s[i] });
      i++;
      continue;
    }
    if (s[i] === '"') {
      let str = '"';
      i++;
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\') { str += s[i]; i++; }
        if (i < s.length) { str += s[i]; i++; }
      }
      if (i < s.length) { str += '"'; i++; }
      let j = i;
      while (j < s.length && /\s/.test(s[j])) j++;
      tokens.push({ type: s[j] === ':' ? 'key' : 'string', value: str });
      continue;
    }
    if (/[-\d]/.test(s[i])) {
      let num = '';
      while (i < s.length && /[-\d.eE+]/.test(s[i])) { num += s[i]; i++; }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    if (s.substring(i, i + 4) === 'true') { tokens.push({ type: 'boolean', value: 'true' }); i += 4; continue; }
    if (s.substring(i, i + 5) === 'false') { tokens.push({ type: 'boolean', value: 'false' }); i += 5; continue; }
    if (s.substring(i, i + 4) === 'null') { tokens.push({ type: 'null', value: 'null' }); i += 4; continue; }
    tokens.push({ type: 'punctuation', value: s[i] }); i++;
  }
  return tokens;
}

export const TOKEN_COLORS = {
  key: '#EDE8DF',
  string: '#7A9E7C',
  number: '#A07840',
  boolean: '#8A8278',
  null: '#8A8278',
  punctuation: '#5C5750',
  whitespace: 'transparent',
};
