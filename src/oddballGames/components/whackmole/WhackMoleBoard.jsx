import WhackMoleHole from './WhackMoleHole';

/**
 * Fixed 3x3 grid, positions 1-9 (spec section 12):
 * 1 2 3
 * 4 5 6
 * 7 8 9
 * Layout never changes during a session — only which single hole is
 * currently active (spec section 6: "Only ONE target should be active at
 * a time during the primary assessment mode").
 */
export default function WhackMoleBoard({ totalHoles, activePosition, feedback, onTap, disabled }) {
  const positions = Array.from({ length: totalHoles }, (_, i) => i + 1);

  return (
    <div className="wm-board" role="group" aria-label="Whack the mole game board">
      {positions.map((position) => (
        <WhackMoleHole
          key={position}
          position={position}
          isActive={activePosition === position}
          feedback={feedback && feedback.position === position ? feedback.type : null}
          onTap={onTap}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
