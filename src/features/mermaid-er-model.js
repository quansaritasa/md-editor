'use strict';

/* ================= mermaid ER model — keys and relationships, from source =================
   The rendered SVG says which tables touch, but not how: cardinality lives in
   marker ids, and key columns are just more text in a row. mermaid's own
   parser has all of it, so the diagram's source is parsed again here and
   nothing is scraped. An entity's id ("entity-ORDER-1") is the same key the
   SVG's <g class="node"> carries, which is what joins this model to focus.

   mermaid stores a relationship's cardinalities crosswise: `A ||--o{ B` gives
   cardB = ONLY_ONE (the end drawn at A) and cardA = ZERO_OR_MORE (the end at
   B). They are straightened out once, here, as `atA` / `atB`.

   ER syntax never says which FK column backs which relationship, so none is
   guessed: each table simply lists its own PK and FK columns. */

const deps = require('../deps');

const CARD = {
  ONLY_ONE: { short: '1', many: false },
  ZERO_OR_ONE: { short: '0..1', many: false },
  ONE_OR_MORE: { short: '1..*', many: true },
  ZERO_OR_MORE: { short: '0..*', many: true },
  MD_PARENT: { short: 'parent', many: false },
};
const card = (c) => CARD[c] || { short: String(c || '?').toLowerCase(), many: false };

function withKey(attrs, k) {
  return attrs.filter((a) => (a.keys || []).includes(k))
    .map((a) => ({ name: a.name, type: a.type || '', comment: a.comment || '' }));
}

// db is mermaid's ER db: getEntities() -> Map(name -> entity), getRelationships() -> [].
function fromDb(db) {
  const tables = new Map();
  db.getEntities().forEach((e, name) => {
    const attrs = e.attributes || [];
    tables.set(e.id, { key: e.id, name, label: e.alias || name, pks: withKey(attrs, 'PK'), fks: withKey(attrs, 'FK') });
  });
  const rels = [];
  db.getRelationships().forEach((r) => {
    const a = tables.get(r.entityA), b = tables.get(r.entityB);
    if (!a || !b || !r.relSpec) return; // an end that is a subgraph, not a table
    rels.push({
      a, b, label: r.roleA || '',
      atA: card(r.relSpec.cardB), atB: card(r.relSpec.cardA),
      identifying: r.relSpec.relType === 'IDENTIFYING',
    });
  });
  return { tables, rels };
}

// Every relationship of one table, told from its side: `partner` is the other
// table, `mine` the cardinality at this table's end, `theirs` at the partner's.
function relationsOf(model, key) {
  const out = [];
  model.rels.forEach((r) => {
    if (r.a.key === key) out.push({ partner: r.b, mine: r.atA, theirs: r.atB, label: r.label, identifying: r.identifying });
    else if (r.b.key === key) out.push({ partner: r.a, mine: r.atB, theirs: r.atA, label: r.label, identifying: r.identifying });
  });
  return out;
}

// A relationship in plain words, the "one" side always first: from ORDER,
// CUSTOMER places ORDER reads "One CUSTOMER – many ORDER", never "many-to-one".
// kind and cards follow the same order, so all three read left to right alike.
function describe(table, rel) {
  let ends = [{ name: table.label, card: rel.mine }, { name: rel.partner.label, card: rel.theirs }];
  if (ends[0].card.many && !ends[1].card.many) ends = [ends[1], ends[0]];
  const word = (e) => (e.card.many ? 'many' : 'one');
  return {
    text: ends.map((e, i) => (i ? word(e) : word(e)[0].toUpperCase() + word(e).slice(1)) + ' ' + e.name).join(' – '),
    kind: word(ends[0]) + '-to-' + word(ends[1]),
    cards: ends[0].card.short + ' : ' + ends[1].card.short,
  };
}

// Parse `src` with the host's mermaid. null for anything that is not an ER
// diagram, or when mermaid is missing or refuses the source.
async function load(src) {
  const m = deps.mermaid();
  const api = m && m.mermaidAPI;
  if (!src || !api || typeof api.getDiagramFromText !== 'function') return null;
  try {
    const dia = await api.getDiagramFromText(src);
    const db = dia && dia.db;
    if (!db || typeof db.getEntities !== 'function' || typeof db.getRelationships !== 'function') return null;
    return fromDb(db);
  } catch (err) {
    return null;
  }
}

module.exports = { load, fromDb, relationsOf, describe };
