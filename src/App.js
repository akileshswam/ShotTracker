import React from 'react';
import './App.css';
import CourtTracker from './components/CourtTracker';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Swamy Shot Tracker</h1>
        <p className="header-subtitle">Track shots, analyze statistics, improve your game</p>
      </header>
      <main>
        <CourtTracker />
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Swamylytics Basketball. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
