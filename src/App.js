import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import LeagueDashboard from './pages/LeagueDashboard';

function App() {
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('token') !== null
  );

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      <LeagueDashboard />
    </div>
  );
}

export default App;