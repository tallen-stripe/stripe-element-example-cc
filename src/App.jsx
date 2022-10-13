import React from "react";
import {   
  BrowserRouter,
  Routes,
  Route,
 } from "react-router-dom";
import Checkout from "./Checkout";
import Confirm from "./Confirm";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Checkout />} />
        <Route path="/confirm" element={<Confirm />} />
      </Routes>
    </BrowserRouter>
  );
}