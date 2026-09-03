import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import VisualMemoryGame from './VisualMemoryGame.jsx';

export default makeReactGameModule({
  id: 'visual-memory',
  mode: 'weekly',
  lobe: 'occipital',
  Component: VisualMemoryGame,
});
