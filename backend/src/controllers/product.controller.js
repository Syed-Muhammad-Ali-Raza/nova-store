const prisma = require('../utils/prisma');

// Seed some products if none exist
const seedProducts = async () => {
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Wireless Noise-Cancelling Headphones',
          description: 'Premium sound quality with 30-hour battery life and active noise cancellation.',
          price: 299.99,
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        },
        {
          name: 'Mechanical Gaming Keyboard',
          description: 'RGB backlit mechanical keyboard with tactile switches and wrist rest.',
          price: 149.99,
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80',
        },
        {
          name: '4K Ultra HD Monitor',
          description: '27-inch 4K display with 144Hz refresh rate and HDR support.',
          price: 499.99,
          stock: 20,
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
        },
        {
          name: 'Ergonomic Office Chair',
          description: 'Lumbar support, adjustable armrests, and breathable mesh back.',
          price: 389.99,
          stock: 15,
          imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80',
        },
        {
          name: 'Smart Watch Pro',
          description: 'Health monitoring, GPS, and 7-day battery life in a sleek design.',
          price: 249.99,
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        },
        {
          name: 'Portable Bluetooth Speaker',
          description: 'Waterproof, 360° surround sound with 24 hours playtime.',
          price: 89.99,
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
        },
      ],
    });
    console.log('✅ Products seeded successfully');
  }
};

const getProducts = async (req, res) => {
  try {
    await seedProducts();
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProducts, getProductById };
