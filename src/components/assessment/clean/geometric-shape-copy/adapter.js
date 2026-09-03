import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import GeometryGame from './GeometryGame.jsx';

export default makeReactGameModule({
  id: 'geometric-shape-copy',
  mode: 'weekly',
  lobe: 'parietal',
  Component: GeometryGame,
});
