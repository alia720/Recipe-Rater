import React from 'react';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <div className="min-h-screen w-full bg-black">
      <Navbar />
      <div className="text-white">Hello World!</div>
    </div>
  );
} export default App;