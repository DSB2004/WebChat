
import './App.css';
import SignUp from './Component/Sign/SignUp'
import SignIn from './Component/Sign/SignIn'
import Homepage from './Component/Homepage/Homepage'
import Main from './Component/Main/Main'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  // const [url, set_url] = React.useState("https://" + window.location.hostname)
  const [url, set_url] = React.useState("http://localhost")
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/SignIn" element={<SignIn URL={url} />} />
          <Route path="/SignUp" element={<SignUp URL={url} />} />
          <Route path="/Main" element={<Main URL={url} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
