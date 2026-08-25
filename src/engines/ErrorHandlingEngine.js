import { ERROR_TYPES } from '../config/errorConfig.js';

const SUPPORT_OFFER = 'If this keeps happening, I can open Support for you -- just ask.';

// Formats one of the 12 configured error types into a consistent
// explanation + numbered troubleshooting steps + support offer. Pure and
// config-driven: adding a 13th error type only ever requires an
// errorConfig.js edit, never a change here.
export const ErrorHandlingEngine = {
  listCodes() {
    return Object.keys(ERROR_TYPES);
  },

  format(code, errorTypes = ERROR_TYPES) {
    const entry = errorTypes[code];
    if (!entry) return null;
    const steps = entry.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    return `${entry.explanation}\n\n${steps}\n\n${SUPPORT_OFFER}`;
  },
};
