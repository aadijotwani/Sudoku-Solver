import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Navbar from './components/Navbar';

const App = () => {
  const [newPuzzleTrigger, setNewPuzzleTrigger] = useState(0);

  const handleNewPuzzle = () => {
    setNewPuzzleTrigger((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <Navbar onNewPuzzle={handleNewPuzzle} />
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={<Home newPuzzleTrigger={newPuzzleTrigger} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
