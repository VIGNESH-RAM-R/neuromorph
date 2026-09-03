import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import TokenTestGame from './TokenTestGame.jsx';

export default makeReactGameModule({
  id: 'token-test',
  mode: 'weekly',
  lobe: 'temporal',
  Component: TokenTestGame,
});
