import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import DelayedRecognitionGame from './DelayedRecognitionGame.jsx';

export default makeReactGameModule({
  id: 'delayed-recognition',
  mode: 'weekly',
  lobe: 'temporal',
  Component: DelayedRecognitionGame,
});
