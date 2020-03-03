import React from 'react';
import { Router } from '@reach/router';
import Header from './components/Header';
import Home from './screens/Home';
import Explore from './screens/Explore';
import Query from './screens/Query';

function App() {
  return (
    <div className="antialiased font-sans text-blue-1100 w-full h-full flex flex-col items-center bg-red-100 overflow-auto">
      <div className="w-full flex-grow flex flex-col items-center flex-shrink-0">
        <Header />
        <Router className="w-full flex flex-col items-center flex-shrink-0 px-6">
          <Home path="/" />
          <Explore path="/explore" />
          <Query path="/query" />
        </Router>
      </div>
      <footer className="text-xs text-blue-1100 mb-2 flex-shrink-0">
        &copy; {new Date().getFullYear()} Demian Dekoninck
      </footer>
    </div>
  );
}

export default App;
