import { makeReactGameModule } from '../../lib/mountReactGame.jsx';
import FaceRecognitionGame from './FaceRecognitionGame.jsx';

export default makeReactGameModule({
  id: 'face-recognition',
  mode: 'weekly',
  lobe: 'occipital',
  Component: FaceRecognitionGame,
});
