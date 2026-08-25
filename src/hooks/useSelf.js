import { useMemo } from 'react';
import { SelfModel } from '../engines/SelfModel.js';

// Thin hook: builds the assembled self-view once per render from whatever
// mock/real record is passed in. Kept separate from useAuth so swapping in
// a real per-user data source later only means changing what's passed as
// `self`, not how any screen reads from it.
export function useSelf(self, now = new Date()) {
  return useMemo(() => (self ? SelfModel.build(self, now) : null), [self, now]);
}
