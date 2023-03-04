import React from 'react';
import {MineSweeper} from "./Components";
import './App.scss';

export const App: React.FC = () => {
  return (
    <div className="App">
      <MineSweeper/>
    </div>
  );
}
