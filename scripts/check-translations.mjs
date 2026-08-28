#!/usr/bin/env node
// Audits every domain string table in src/i18n/ for key-parity across all 7
// languages. Run this after adding or editing any UI copy:
//
//   node scripts/check-translations.mjs
//
// This is the "automatic" safety net for the "once I add new features it
// should automatically get translated" ask: this app doesn't call a live
// translation API for UI chrome (deliberately -- no runtime latency/cost/
// failure risk during a demo), so "automatic" here means "impossible to
// accidentally ship English-only" -- this script fails loudly (non-zero
// exit code) if any dictionary is missing a key some other language has,
// telling you exactly which file/language/key to fix. Wire it into a
// pre-commit hook or CI step if you want it fully enforced.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STRINGS_DIRS = [
  path.join(__dirname, '..', 'src', 'i18n'),
  path.join(__dirname, '..', 'src', 'i18n', 'strings'),
  // 2026-08-26 ADDITION: after the doctorDashboard merge (2026-08-23) this
  // script kept scanning only app_page's own src/i18n/** and silently never
  // covered the Doctor Dashboard's separate src/doctorDashboard/i18n/**
  // string tables (auth.js, common.js, patients.js, and now report.js) --
  // meaning every doctor-side translation shipped with zero automated
  // parity checking since the merge. Added here so "run this after adding
  // or editing any UI copy" (this file's own header comment) is actually
  // true for both dashboards, not just the patient one.
  path.join(__dirname, '..', 'src', 'doctorDashboard', 'i18n'),
  path.join(__dirname, '..', 'src', 'doctorDashboard', 'i18n', 'strings'),
];
const EXPECTED_LANGUAGES = ['en', 'hi', 'ta', 'fr', 'te', 'ur', 'es'];

async function findStringExports(filePath) {
  const mod = await import(pathToFileURL(filePath).href);
  const exports = [];
  for (const [name, value] of Object.entries(mod)) {
    if (
      name.endsWith('_STRINGS') &&
      value &&
      typeof value === 'object' &&
      EXPECTED_LANGUAGES.some((l) => l in value)
    ) {
      exports.push({ name, dict: value });
    }
  }
  return exports;
}

function keysOf(obj) {
  return Object.keys(obj).sort();
}

async function main() {
  let problems = 0;
  let filesChecked = 0;
  let tablesChecked = 0;

  for (const dir of STRINGS_DIRS) {
    let entries;
    try {
      entries = readdirSync(dir).filter((f) => f.endsWith('.js'));
    } catch {
      continue;
    }
    for (const file of entries) {
      const filePath = path.join(dir, file);
      filesChecked++;
      const tables = await findStringExports(filePath);
      for (const { name, dict } of tables) {
        tablesChecked++;
        const missingLanguages = EXPECTED_LANGUAGES.filter((l) => !dict[l]);
        if (missingLanguages.length > 0) {
          problems++;
          console.error(`FAIL ${file} :: ${name} -- missing language(s) entirely: ${missingLanguages.join(', ')}`);
          continue;
        }
        const englishKeys = keysOf(dict.en);
        for (const lang of EXPECTED_LANGUAGES) {
          if (lang === 'en') continue;
          const langKeys = keysOf(dict[lang]);
          const missing = englishKeys.filter((k) => !langKeys.includes(k));
          const extra = langKeys.filter((k) => !englishKeys.includes(k));
          if (missing.length > 0) {
            problems++;
            console.error(`FAIL ${file} :: ${name}.${lang} -- missing key(s): ${missing.join(', ')}`);
          }
          if (extra.length > 0) {
            problems++;
            console.error(`FAIL ${file} :: ${name}.${lang} -- extra/stale key(s) not in English: ${extra.join(', ')}`);
          }
        }
      }
    }
  }

  console.log(`\nChecked ${tablesChecked} string table(s) across ${filesChecked} file(s).`);
  if (problems > 0) {
    console.error(`${problems} translation-parity problem(s) found.`);
    process.exit(1);
  }
  console.log('All string tables have full 7-language parity.');
}

main();
