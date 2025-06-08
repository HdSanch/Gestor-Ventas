import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SaleList() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('https://mmtkdj1aj0.execute-api.us-east-1.amazonaws.com/lab/sales');
      console.log('Respuesta API:', res.data);
      setSales(JSON.parse(res.data.body));
    } catch (error) {
      console.error('Error cargando ventas', error);
    }
  };

  return (
    <div>
      <h2>Ventas Registradas</h2>
      <ul>
        {sales.map((sale) => (
          <li key={`${sale.nombre}-${sale.cantidad}-${sale.precio}`}>
            {sale.nombre} - Cantidad: {sale.cantidad} - Precio: $
            {typeof sale.precio === 'number' ? sale.precio.toFixed(2) : 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SaleList;
