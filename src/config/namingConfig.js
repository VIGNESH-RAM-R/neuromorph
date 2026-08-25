// Multiple-choice picture naming -- deliberately choice-based rather than
// typed, so scoring is always an exact match with no typo/spelling penalty
// unrelated to the actual naming ability being tested.
//
// Only 4 of ObjectIcon's 8 available shapes are used here; the other 4
// (umbrella, clock, star, tree) are reserved for the occipital Visual
// Object Naming task (see objectNamingConfig.js) so no patient sees the
// same picture twice in one assessment session, even rendered differently.
export const NAMING_ITEMS = [
  { id: 'house', correctLabel: 'House', choices: ['House', 'Tent', 'Boat', 'Bridge'] },
  { id: 'key', correctLabel: 'Key', choices: ['Spoon', 'Comb', 'Key', 'Pen'] },
  { id: 'cup', correctLabel: 'Cup', choices: ['Bowl', 'Cup', 'Vase', 'Jar'] },
  { id: 'bicycle', correctLabel: 'Bicycle', choices: ['Car', 'Scooter', 'Bicycle', 'Ladder'] },
];
