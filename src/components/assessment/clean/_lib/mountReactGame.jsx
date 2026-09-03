import { createRoot } from 'react-dom/client';

/**
 * Shared mount/unmount plumbing for a React-based weekly game adapter — each
 * adapter.js supplies its own top-level component and calls this once,
 * rather than repeating createRoot/unmount boilerplate across every game.
 *
 * Extends the literal single-callback GameModule contract (§A.1) with an
 * optional `onPracticeComplete`: every integrated weekly game runs its own
 * practice round internally as part of one continuous mount (practice ->
 * countdown -> scored -> its own report screen), not as a separate
 * externally-controlled phase, so there's no clean point for a session
 * player to intervene between practice and scored. `onPracticeComplete`
 * lets the game report its practice trials (logged as is_practice rows)
 * without needing an external controller to orchestrate that boundary.
 * Games with no separate practice phase just never call it.
 *
 * `onExit` is forwarded the same way for the 6 daily games, each of which
 * already has its own "Back" button wired to an `onExit` prop internally
 * (features/04's ODD BALL delivery) — connected below, so Back correctly
 * navigates on every one of them. The 7 weekly games don't take this prop
 * at all and just ignore it. (An earlier version of this comment claimed
 * `onExit` "was never actually connected here" — checked during this
 * project's own full-app review and found untrue: it's wired on the very
 * next line. Correcting a stale comment, not a behavior change.)
 */
export function makeReactGameModule({ id, mode, lobe, dailyCategory, Component }) {
  let root = null;
  return {
    id,
    mode,
    lobe,
    dailyCategory,
    mount(container, config, callbacks) {
      root = createRoot(container);
      root.render(
        <Component
          config={config}
          // Forwarded straight through, not read via useApiClient() inside
          // Component itself: this tree is its own separate createRoot(),
          // with none of the outer app's providers (ClerkProvider included)
          // in scope, so a hook needing Clerk context would throw the
          // instant a game tried to use it. Only speech-assessment needs
          // this today (see its own adapter/component for why) — every
          // other game just ignores an unused prop.
          api={callbacks.api}
          onComplete={callbacks.onComplete}
          onPracticeComplete={callbacks.onPracticeComplete}
          onExit={callbacks.onExit}
        />
      );
    },
    unmount() {
      root?.unmount();
      root = null;
    },
  };
}
