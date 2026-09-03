export default function InstructionScreen({ categoryCount, onStart }) {
  return (
    <div className="drt-screen">
      <h1>Delayed recognition memory test</h1>
      <p className="drt-eyebrow">NEUROMORPH — Delayed Recognition component</p>
      <p className="drt-body">
        You will now be shown a series of items. Some of these were presented
        earlier during today's assessment. Select only the items that you
        remember seeing previously. Work as accurately and quickly as possible.
      </p>
      <p className="drt-fine-print">
        {categoryCount} {categoryCount === 1 ? 'category' : 'categories'} retrieved from earlier in this session.
      </p>
      <button className="drt-btn drt-btn--primary" onClick={onStart}>Start assessment</button>
    </div>
  );
}
