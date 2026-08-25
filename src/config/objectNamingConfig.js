// Visual Object Naming (occipital) -- reuses the 4 ObjectIcon shapes NOT
// used by the temporal Naming Task (see namingConfig.js), rendered as flat
// silhouettes instead of detailed line drawings. Stripping internal detail
// and testing recognition from outline/silhouette alone is what makes this
// a basic-visual-processing task rather than a language/retrieval task --
// hence occipital, not temporal, even though the interaction (pick the
// matching word) looks identical to the Naming Task.
export const OBJECT_NAMING_ITEMS = [
  { id: 'umbrella', correctLabel: 'Umbrella', choices: ['Fan', 'Umbrella', 'Kite', 'Flag'] },
  { id: 'clock', correctLabel: 'Clock', choices: ['Clock', 'Coin', 'Wheel', 'Plate'] },
  { id: 'star', correctLabel: 'Star', choices: ['Sun', 'Flower', 'Star', 'Snowflake'] },
  { id: 'tree', correctLabel: 'Tree', choices: ['Tree', 'Bush', 'Flower', 'Cactus'] },
];
