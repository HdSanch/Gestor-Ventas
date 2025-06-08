import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SaleList() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/sales');
      setSales(res.data);
    } catch (error) {
      console.error('Error cargando ventas', error);
    }
  };

  return (
    <div>
      <h2>Ventas Registradas</h2>
      <ul>
        {sales.map((sale) => (
          <li key={sale.id}>
            {sale.product} - Cantidad: {sale.quantity} - Precio: ${sale.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SaleList;
