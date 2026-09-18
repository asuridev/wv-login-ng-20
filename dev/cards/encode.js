#!/usr/bin/env node
/**
 * Codifica los JSON de `dev/cards/*.json` al formato que consume el configmap.
 *
 *   node dev/cards/encode.js            imprime SETTING_CARDS_<PARTNER>=<base64>
 *   node dev/cards/encode.js --env-js   ademas regenera public/assets/env/env.js
 *                                       para desarrollo local
 *
 * Nunca generes el base64 a mano: un valor corrupto deja al partner sin cards
 * en produccion y el error solo se ve en la consola del navegador.
 */
const fs = require('node:fs');
const path = require('node:path');

const CARDS_DIR = __dirname;
const ENV_JS = path.join(__dirname, '..', '..', 'public', 'assets', 'env', 'env.js');

/** Campos obligatorios de cada card; refleja `isValidCard` en el front. */
const REQUIRED_STRINGS = ['key', 'title', 'badge', 'button', 'url'];

function validate(cards, file) {
  if (!Array.isArray(cards)) {
    throw new Error(`${file}: el JSON debe ser un array de cards.`);
  }

  cards.forEach((card, index) => {
    for (const field of REQUIRED_STRINGS) {
      if (typeof card[field] !== 'string' || card[field].trim() === '') {
        throw new Error(`${file}[${index}]: "${field}" debe ser un string no vacio.`);
      }
    }
    if (typeof card.productType !== 'number' || !Number.isFinite(card.productType)) {
      throw new Error(`${file}[${index}]: "productType" debe ser un numero.`);
    }
    if (card.permission !== undefined && typeof card.permission !== 'string') {
      throw new Error(`${file}[${index}]: "permission" debe ser un string si se declara.`);
    }
  });
}

function encodeAll() {
  return fs
    .readdirSync(CARDS_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(CARDS_DIR, file), 'utf8');
      const cards = JSON.parse(raw);
      validate(cards, file);

      const partner = path.basename(file, '.json');
      return {
        partner,
        variable: `SETTING_CARDS_${partner.toUpperCase()}`,
        // JSON.stringify sin espacios: el valor viaja en una variable de entorno.
        value: Buffer.from(JSON.stringify(cards), 'utf8').toString('base64'),
        count: cards.length,
      };
    });
}

function writeEnvJs(entries) {
  const lines = entries
    .map((entry) => `  window["env"]["${entry.variable}"] = "${entry.value}";`)
    .join('\n');

  const content = `// GENERADO por \`npm run cards:encode -- --env-js\` — no editar a mano.
// Solo para desarrollo local: en el contenedor nginx sirve /tmp/env.js.
(function (window) {
  window["env"] = window["env"] || {};

${lines}
})(this);
`;

  fs.writeFileSync(ENV_JS, content, 'utf8');
  console.error(`\nEscrito ${path.relative(process.cwd(), ENV_JS)}`);
}

const entries = encodeAll();
for (const entry of entries) {
  console.log(`${entry.variable}=${entry.value}`);
}
console.error(
  `\n${entries.length} partner(s): ${entries.map((e) => `${e.partner} (${e.count} cards)`).join(', ')}`
);

if (process.argv.includes('--env-js')) {
  writeEnvJs(entries);
}
