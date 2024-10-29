import React from 'react';
import SheetDisplay from '../components/SheetDisplay';

const Home: React.FC = () => {
  return (
    <div>
      <h1 style={{ color: '#ffffff' }}>Welcome to WhatsApp Bulk Messaging</h1>
      <SheetDisplay />
    </div>
  );
};

export default Home;