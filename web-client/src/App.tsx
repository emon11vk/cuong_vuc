import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapScreen } from './screens/MapScreen';
import { GameScreen } from './screens/GameScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main map is the default route */}
        <Route path="/" element={<MapScreen />} />
        
        {/* The minigames are loaded here based on the ID */}
        <Route path="/minigame/:id" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
