import React, { useState } from 'react';
import axios from 'axios';

function SaleForm() {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://mmtkdj1aj0.execute-api.us-east-1.amazonaws.com/lab/postsales', {
        nombre,
        cantidad: Number(cantidad),
        precio: Number(precio),
      });
      alert('Venta registrada');
      setNombre('');
      setCantidad(1);
      setPrecio(0);
    } catch (error) {
      console.error('Error al registrar venta:', error.response || error.message);
      alert('Error al registrar venta: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Nombre del producto"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        min={1}
        onChange={(e) => setCantidad(Number(e.target.value))}
        required
      />
      <input
        type="number"
        placeholder="Precio"
        value={precio}
        min={0}
        step="0.01"
        onChange={(e) => setPrecio(Number(e.target.value))}
        required
      />
      <button type="submit">Agregar Venta</button>
    </form>
  );
}

export default SaleForm;
