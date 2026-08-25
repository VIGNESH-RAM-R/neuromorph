import { useCallback, useEffect, useState } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import OddballAssessment from './components/oddball/OddballAssessment';
import SequenceMemoryAssessment from './components/sequence/SequenceMemoryAssessment';
import PointClickGame from './components/pointclick/PointClickGame';
import ImagePairsAssessment from './components/imagepairs/ImagePairsAssessment';
import WhackMoleAssessment from './components/whackmole/WhackMoleAssessment';
import SpotDifferenceAssessment from './components/spotdifference/SpotDifferenceAssessment';

/**
 * Real logged-in patient's name, passed down from app_page (see
 * OddballGamesLauncher.jsx -> GamesSection.jsx's `self.name`). Falls back
 * to this placeholder only if App is ever rendered without a name (e.g.
 * this project's own `npm run dev`, outside app_page).
 */
const FALLBACK_USER = { name: 'Guest' };

/**
 * Minimal internal view switcher. This project has no existing router, so a
 * lightweight state (rather than pulling in a routing library) is used to
 * move between the Neuromorph dashboard and each assessment module.
 * Structured so a real router can be dropped in later without touching the
 * module components themselves.
 */
export default function App({ user, initialDomain, initialGame }) {
  const [view, setView] = useState('dashboard');

  const launchOddball = useCallback(() => setView('oddball'), []);
  const launchSequenceMemory = useCallback(() => setView('sequence'), []);
  const launchPointClick = useCallback(() => setView('pointclick'), []);
  const launchImagePairs = useCallback(() => setView('imagepairs'), []);
  const launchWhackMole = useCallback(() => setView('whackmole'), []);
  const launchSpotDifference = useCallback(() => setView('spotdifference'), []);
  const backToDashboard = useCallback(() => setView('dashboard'), []);

  const launchHandlers = {
    oddball: launchOddball,
    sequence: launchSequenceMemory,
    pointclick: launchPointClick,
    imagepairs: launchImagePairs,
    whackmole: launchWhackMole,
    spotdifference: launchSpotDifference,
  };

  useEffect(() => {
    if (initialGame && launchHandlers[initialGame]) launchHandlers[initialGame]();
  }, [initialGame]);

  return (
    <>
      {view === 'dashboard' && (
        <Dashboard
          user={user || FALLBACK_USER}
          initialDomain={initialDomain}
          onLaunchOddball={launchOddball}
          onLaunchSequenceMemory={launchSequenceMemory}
          onLaunchPointClick={launchPointClick}
          onLaunchImagePairs={launchImagePairs}
          onLaunchWhackMole={launchWhackMole}
          onLaunchSpotDifference={launchSpotDifference}
        />
      )}
      {view === 'oddball' && <OddballAssessment onExit={backToDashboard} />}
      {view === 'sequence' && <SequenceMemoryAssessment onExit={backToDashboard} />}
      {view === 'pointclick' && <PointClickGame onExit={backToDashboard} />}
      {view === 'imagepairs' && <ImagePairsAssessment onExit={backToDashboard} />}
      {view === 'whackmole' && <WhackMoleAssessment onExit={backToDashboard} />}
      {view === 'spotdifference' && <SpotDifferenceAssessment onExit={backToDashboard} />}
    </>
  );
}
