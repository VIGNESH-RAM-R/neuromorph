// ValidationEngine
// -----------------------------------------------------------------------------
// Single responsibility: compare a participant's selected object IDs against
// a trial's recognition grid and classify every grid item into exactly one
// of hit / miss / false positive / correct rejection. Pure function, no side
// effects, no knowledge of timers or React state.
export const ValidationEngine = {
  validate(selectedIds, grid) {
    let hits = 0, misses = 0, falsePositives = 0, correctRejections = 0;
    grid.forEach((item) => {
      const selected = selectedIds.includes(item.id);
      if (item.isTarget && selected) hits++;
      else if (item.isTarget && !selected) misses++;
      else if (!item.isTarget && selected) falsePositives++;
      else correctRejections++;
    });
    return {
      hits, misses, falsePositives, correctRejections,
      totalTargets: grid.filter((g) => g.isTarget).length,
      totalDistractors: grid.filter((g) => !g.isTarget).length
    };
  }
};
