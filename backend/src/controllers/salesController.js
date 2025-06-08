const dynamoService = require('../services/dynamoService');

exports.createSale = async (req, res) => {
  try {
    const sale = req.body;
    await dynamoService.addSale(sale);
    res.status(201).json({ message: 'Venta creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await dynamoService.getAllSales();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
