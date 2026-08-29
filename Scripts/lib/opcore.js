// lib/opcore.js

/** ---------- tiny tokenizer (quotes + escapes) ---------- */
function splitArgs(s) {
  const out = []; let cur = ''; let q = null; let esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (esc) { cur += c; esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (q) { if (c === q) { q = null; continue; } cur += c; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (/\s/.test(c)) { if (cur) { out.push(cur); cur=''; } continue; }
    cur += c;
  }
  if (cur) out.push(cur);
  return out;
}



let dbg = {
  enabled: true,
  state: [],
  push: function (s) { this.state.push(s); },
  pop: function () { return this.state.pop(); },
  reset: function () { this.state = []; },
  get: function () { return this.state.join(''); },
  set: function (sary) { this.state = sary; },
  getStats: function () {
    let obj = {
      count: this.state.length,
      last: this.state[this.state.length - 1] || '',
      initFullCount: this.state?.[0]?.fullText?.length || '',
      initSelected: this.state?.[0]?.text === this.state?.[0]?.fullText
    };
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n');
  },
}

function stripQuotes(x) {
  if (!x) return x;
  if ((x.startsWith('"') && x.endsWith('"')) || (x.startsWith("'") && x.endsWith("'")))
    return x.slice(1, -1);
  return x;
}

function appendIfFullText(state, text) {
  if (state.fullText === state.text) {
    state.fullText = state.fullText + "\n" + text;
  }
  else {
    state.text = text;
  }
}

/** ---------- header:  op <name> [positional] [k=v] ---------- */
function parseHeader(line) {
  const m = line && line.match(/^\s*op\s+(.+?)\s*$/i);
  if (!m) return null;
  const tokens = splitArgs(m[1]);
  if (!tokens.length) return null;

  const name = tokens.shift();
  const args = [];
  const opts = {};
  for (const t of tokens) {
    const kv = t.match(/^([^=\s]+)=(.*)$/);
    if (kv) opts[kv[1]] = stripQuotes(kv[2]);
    else args.push(stripQuotes(t));
  }
  return { name, args, opts };
}

/** ---------- sed-ish triplet parser for sub ---------- */
function parseDelimTriplet(s) {
  const m = s.match(/^\s*(?<d>[^A-Za-z0-9\s])([\s\S]*)$/);
  if (!m) return [null, null, null];
  const d = m.groups.d; const rest = m[2];

  function splitOnce(str, delim) {
    let i = 0, esc = false;
    for (; i < str.length; i++) {
      const c = str[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === delim) break;
    }
    return i < str.length ? [str.slice(0, i), str.slice(i + 1)] : null;
  }

  const a = splitOnce(rest, d); if (!a) return [null, null, null];
  const b = splitOnce(a[1].trim(), d); if (!b) return [null, null, null];

  const pat = a[0], rep = b[0];
  const flags = (b[1].trim().match(/^[gimsuy]*/) || [''])[0] || 'g';
  return [pat, rep, flags];
}

/** ---------- OPS REGISTRY ---------- */
const ops = {
  seq: {
    desc: 'Generate a numeric sequence',
    usage: 'op seq <start> <end> <step> [delim=", "] [prefix=""]',
    handler: (text, { args, opts }) => {
      const [startS, endS, stepS] = args;
      const start = parseInt(startS, 10);
      const end = parseInt(endS, 10);
      const step = parseInt(stepS, 10);
      if ([start, end, step].some(Number.isNaN)) throw new Error('seq: need numeric start end step');
      if (step === 0) throw new Error('seq: step cannot be 0');

      const forward = end >= start ? step > 0 : step < 0;
      if (!forward) throw new Error('seq: step sign must move toward end');

      const delim = opts.delim ?? ', ';
      const prefix = opts.prefix ?? '';

      const out = [];
      for (let i = start; (step > 0 ? i <= end : i >= end); i += step) out.push(prefix + i);
      return out.join(delim);
    }
  },

  sub: {
    desc: 'Regex substitution',
    usage: 'op sub /pattern/ /replacement/ [flags]   or   op sub pattern="<...>" replacement="<...>" flags="gim"',
    handler: (text, { args, opts }) => {
      let pattern = opts.pattern, replacement = opts.replacement, flags = opts.flags;
      if (!pattern) { const [p, r, f] = parseDelimTriplet(args.join(' ')); pattern = p; replacement = r; flags = f; }
      if (!pattern) throw new Error('sub: missing pattern');

      flags = flags || 'g';
      replacement = (replacement ?? '').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

      const re = new RegExp(pattern, flags);
      return text.replace(re, replacement);
    }
  },
  match: {
    desc: 'Regex match - extract all matches',
    usage: 'op match /pattern/ [flags]   or   op match pattern="<...>" flags="gim"',
    handler: (text, { args, opts }) => {
      let pattern = opts.pattern, flags = opts.flags;
      if (!pattern) { const [p, , f] = parseDelimTriplet(args.join(' ')); pattern = p; flags = f; }
      if (!pattern) throw new Error('match: missing pattern');
      flags = flags || 'g';

      const re = new RegExp(pattern, flags);
      const matches = [];
      let m;
        while ((m = re.exec(text)) !== null) {
            matches.push(m[0]);
        }
      return matches.join('\n');
    }
  },
  help: {
    desc: 'Show help for all ops',
    usage: 'op help',
    handler: () => renderHelp()
  }
};

/** ---------- HELP RENDERER ---------- */
function renderHelp() {
  const rows = Object.entries(ops).map(([name, o]) => `| \`${name}\` | ${o.desc} | \`${o.usage}\` |`);
  return [
    '| Op | Description | Usage |',
    '|---|---|---|',
    ...rows
  ].join('\n');
}

/** ---------- MAIN ENTRY ---------- */
function run(state, presetSpec) {
  dbg.set([state]);
  try {
    // Work on selection if present, else whole text
      const input = state.selection || state.text;

    // If preset provided, use it; otherwise expect header on first line
    let spec = presetSpec;
    let body = input;
    if (!spec) {
      const [head, ...rest] = input.split(/\r?\n/);
      spec = parseHeader(head) || { name: 'help', args: [], opts: {} };
      body = rest.join('\n');
    }

    const op = ops[spec.name];
    if (!op) throw new Error(`Unknown op: ${spec.name}`);

    const out = op.handler(body, spec);

    appendIfFullText(state, out);
    
  } catch (e) {
    state.fullText = state.fullText + "\n\n" + e.message + "\n" + e.stack;
    state.postError(e.message);
  }
  finally {
    if (dbg.enabled) {
      state.fullText += `\n\n<!-- Debug Info:\n ${dbg.getStats()} -->`;
    }
    dbg.reset();
  }
}

module.exports = { run, ops, parseHeader, splitArgs };   