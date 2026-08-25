/**
 * Compact, unobtrusive footer disclaimer for the Results page. The full
 * multi-sentence clinical-safety text this used to show inline has moved to
 * `title` (a native browser tooltip on hover/focus) so the safety
 * information is still present and accessible, but the primary result
 * dashboard stays visually concise per the redesign spec.
 */
export default function OddballDisclaimer() {
  return (
    <div
      className="oddball-disclaimer"
      title="This assessment provides behavioural measures related to attention, response speed, and target detection. It is not a standalone diagnostic test for dementia or other neurological conditions. Results should be interpreted together with other cognitive assessments and, when appropriate, professional clinical evaluation."
    >
      <p>Screening measure only — not a standalone diagnosis.</p>
    </div>
  );
}
