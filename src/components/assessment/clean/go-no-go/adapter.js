import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import GoNoGoGame from './GoNoGoGame.jsx';

export default makeReactGameModule({
  id: 'go-no-go',
  mode: 'weekly',
  lobe: 'frontal',
  Component: GoNoGoGame,
});
