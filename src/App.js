import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import LeagueDashboard from './pages/LeagueDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('token') !== null
  );

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      <LeagueDashboard onLogout={handleLogout} />
    </div>
  );
}

export default App;