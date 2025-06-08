const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({ region: process.env.AWS_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;

router.post('/', async (req, res) => {
  const { product, amount } = req.body;

  if (!product || !amount) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const sale = {
    id: Date.now().toString(),
    product,
    amount,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: sale,
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).json(sale);
  } catch (error) {
    console.error('Error al guardar en DynamoDB:', error);
    res.status(500).json({ error: 'Error al guardar la venta' });
  }
});

module.exports = router;
