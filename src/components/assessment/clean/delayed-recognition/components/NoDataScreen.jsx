export default function NoDataScreen() {
  return (
    <div className="drt-screen">
      <h1>Delayed recognition memory test</h1>
      <p className="drt-body">No delayed recognition assessment available.</p>
      <p className="drt-fine-print">
        No study items have been registered by any earlier module in this
        session yet. Complete a module that registers with the shared
        StudyItemRegistry (such as Visual Memory Test) first.
      </p>
    </div>
  );
}
