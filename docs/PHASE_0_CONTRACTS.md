# Phase 0 — Understand the two contracts you're bridging

This repo's existing task components (`src/components/assessment/StroopTask.jsx` etc.) are plain React components rendered directly by `AssessmentSection.jsx`:

```jsx
<StroopTask onSubmit={({ score, raw }) => {...}} language={language} />
```

The clean modules in `clean/<task-id>/adapter.js` are a different shape — a `GameModule`:

```js
{
  id, mode, lobe,
  mount(container, config, callbacks) { ... },  // imperative: creates its own React root inside `container`
  unmount() { ... },
}
```

`callbacks.onComplete(result)` fires once, with `result = { score, trials, studyItemsRegistered?, rawLog? }`. `callbacks.onPracticeComplete` fires once per completed practice round (some tasks have none).

**Phase 1 builds the one adapter that bridges this gap. Every later phase just reuses it.**
