import React from 'react';
import SaleForm from './components/SaleForm';
import SaleList from './components/SaleList';

function App() {
  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Gestor de Ventas</h1>
      <SaleForm />
      <SaleList />
    </div>
  );
}

export default App;
