import React from 'react';

const Header = ({ handleLogout }) => {
  return (
    <div className="header">
      <h1>Texts</h1>
      <div className="logout-button">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Header;
