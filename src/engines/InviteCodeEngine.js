// Pure logic for the patient <-> caregiver invite-code link. Deliberately
// excludes ambiguous characters (0/O, 1/I/L) so a code read aloud or
// handwritten is never misread. No network/Firestore import here -- the
// actual generate-and-store / look-up-and-link steps live in
// FirestoreUserService.js (write) and useCaregiverAuth.js (read), same
// pure-engine/service split as every other module in this app.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export const InviteCodeEngine = {
  // Not cryptographically secure (doesn't need to be -- this is a
  // low-stakes, revocable pairing code, not an auth credential), but never
  // Math.random-predictable in a way that matters: crypto.getRandomValues
  // is used when available (real browsers), with a Math.random fallback so
  // this stays testable in plain Node.
  generate(randomSource = globalThis.crypto) {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      const index = randomSource?.getRandomValues
        ? randomSource.getRandomValues(new Uint32Array(1))[0] % CODE_ALPHABET.length
        : Math.floor(Math.random() * CODE_ALPHABET.length);
      code += CODE_ALPHABET[index];
    }
    return code;
  },

  // Normalizes user-typed input (trims, uppercases, strips spaces/dashes a
  // caregiver might add out of habit) before it's ever compared or looked
  // up -- so "abc-123" and "ABC123" are treated as the same code.
  normalize(rawCode) {
    return (rawCode || '').toString().trim().toUpperCase().replace(/[\s-]/g, '');
  },

  isValidFormat(code) {
    const normalized = this.normalize(code);
    return normalized.length === CODE_LENGTH && [...normalized].every((c) => CODE_ALPHABET.includes(c));
  },
};
