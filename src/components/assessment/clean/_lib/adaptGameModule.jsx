import { useEffect, useRef } from 'react';

/**
 * Phase 1's one bridge (docs/PHASE_0_CONTRACTS.md) between the two task
 * contracts this repo has to reconcile. It's the mirror image of
 * mountReactGame.jsx: that one turns a React component into a `GameModule`
 * (`{ id, mode, lobe, mount(container, config, callbacks), unmount() }`);
 * this one turns a `GameModule` back into a plain component matching the
 * contract AssessmentSection.jsx already renders every task through --
 *
 *   <TaskComponent onSubmit={({ score, raw }) => {...}} language={language} />
 *
 * -- so AssessmentSection.jsx and useDetectionAssessment.js (which only
 * ever calls the single `submitTaskResult({ score, raw })`, once) never
 * need to know a given TASK_COMPONENTS entry is actually backed by an
 * imperative mount()/unmount() module instead of a component tree. Every
 * later phase that wires a clean/<task-id> module into TASK_COMPONENTS
 * just calls this once per module and drops the result straight in:
 *
 *   stroop: adaptGameModule(stroopAdapter),
 */
export function adaptGameModule(module) {
  function AdaptedTask({ onSubmit, language }) {
    const containerRef = useRef(null);

    // Read via a ref inside the effect below rather than listed as an
    // effect dependency, so a parent re-render that hands down a new
    // `onSubmit`/`language` identity (language especially -- it's a plain
    // prop, not something callback-memoized upstream) can't tear down and
    // remount an in-progress task; only `module` itself changing should
    // ever do that.
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return undefined;

      // `config` is a free-form bag forwarded straight through to the
      // module's own top-level component (see mountReactGame.jsx). The
      // GameModule contract has no dedicated slot for `language` the way
      // the plain-component contract does, so it rides along on `config`
      // instead -- a module that doesn't care about it just ignores the
      // key, same as `api`/`onExit` are ignored by modules that don't.
      module.mount(
        container,
        { language },
        {
          onComplete: (result) => {
            // { score, trials, studyItemsRegistered?, rawLog? } (§A.1) ->
            // { score, raw }. Nothing is dropped in translation: `raw` is
            // opaque to everything downstream of onSubmit --
            // AssessmentSessionModel.build just stores it per task result
            // without interpreting its shape -- so the whole result object
            // is kept as `raw`, not just its `rawLog` sub-field.
            onSubmitRef.current?.({ score: result?.score, raw: result });
          },
          // The plain-component contract has no separate "a practice round
          // just finished" event -- AssessmentSection only ever reacts to
          // the one terminal onSubmit -- so this is a no-op purely so a
          // module that calls it unconditionally (every module does; see
          // mountReactGame.jsx) doesn't need its own `?.` guard against a
          // callback this side has nowhere to route.
          onPracticeComplete: () => {},
        }
      );

      return () => module.unmount();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module]);

    return <div ref={containerRef} className="nmpa-task-host" />;
  }

  AdaptedTask.displayName = `AdaptedTask(${module.id})`;
  return AdaptedTask;
}
