// ValidationEngine
// -----------------------------------------------------------------------------
// Single responsibility: compare selected IDs against a recognition grid and
// classify every item as hit / miss / false positive / correct rejection.
// Also returns a per-target outcome breakdown (carrying forward each
// target's original wasRecognizedAtEncoding flag) -- MetricsEngine needs
// this to compute Encoding Preservation Score and Memory Decay Index.
export const ValidationEngine = {
  validate(selectedIds, grid) {
    let hits = 0, misses = 0, falsePositives = 0, correctRejections = 0;
    const targetOutcomes = [];
    grid.forEach((item) => {
      const selected = selectedIds.includes(item.id);
      if (item.isTarget && selected) hits++;
      else if (item.isTarget && !selected) misses++;
      else if (!item.isTarget && selected) falsePositives++;
      else correctRejections++;
      if (item.isTarget) {
        targetOutcomes.push({
          id: item.id,
          wasRecognizedAtEncoding: item.wasRecognizedAtEncoding,
          recognizedNow: selected
        });
      }
    });
    return {
      hits, misses, falsePositives, correctRejections,
      totalTargets: grid.filter((g) => g.isTarget).length,
      totalDistractors: grid.filter((g) => !g.isTarget).length,
      targetOutcomes
    };
  }
};
