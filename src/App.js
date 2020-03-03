import React from 'react';
import { Router } from '@reach/router';
import Header from './components/Header';
import Home from './screens/Home';
import Explore from './screens/Explore';

function App() {
  return (
    <div className="antialiased font-sans text-blue-1100 w-full h-full flex flex-col flex-shrink-0 items-center bg-red-100">
      <div className="flex-1 w-full h-full flex flex-col flex-shrink-0 items-center">
        <Header />
        <Router className="w-full flex flex-col items-center">
          <Home path="/" />
          <Explore path="/explore" />
        </Router>
      </div>
      <footer className="text-xs text-gray-900 mb-2">
        &copy; {new Date().getFullYear()} Demian Dekoninck
      </footer>
    </div>
  );
}

export default App;
