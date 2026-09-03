import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import StroopGame from './StroopGame.jsx';

export default makeReactGameModule({
  id: 'stroop-task',
  mode: 'weekly',
  lobe: 'frontal',
  Component: StroopGame,
});
