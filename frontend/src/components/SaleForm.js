import React, { useState } from 'react';
import axios from 'axios';

function SaleForm() {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/sales', {
        product,
        quantity: Number(quantity),
        price: Number(price),
      });
      alert('Venta registrada');
      setProduct('');
      setQuantity(1);
      setPrice(0);
    } catch (error) {
      alert('Error al registrar venta');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Producto"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Cantidad"
        value={quantity}
        min={1}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Precio"
        value={price}
        min={0}
        step="0.01"
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <button type="submit">Agregar Venta</button>
    </form>
  );
}

export default SaleForm;
