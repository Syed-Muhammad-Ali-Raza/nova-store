const prisma = require('../utils/prisma');

// Auto-seed products on first load
const seedProducts = async () => {
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium sound quality with 30-hour battery life and active noise cancellation.', price: 299.99, stock: 50, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
        { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with tactile switches and wrist rest.', price: 149.99, stock: 35, category: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80' },
        { name: '4K Ultra HD Monitor', description: '27-inch 4K display with 144Hz refresh rate and HDR support.', price: 499.99, stock: 20, category: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80' },
        { name: 'Ergonomic Office Chair', description: 'Lumbar support, adjustable armrests, and breathable mesh back.', price: 389.99, stock: 15, category: 'Furniture', imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80' },
        { name: 'Smart Watch Pro', description: 'Health monitoring, GPS, and 7-day battery life in a sleek design.', price: 249.99, stock: 40, category: 'Wearables', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
        { name: 'Portable Bluetooth Speaker', description: 'Waterproof, 360° surround sound with 24 hours playtime.', price: 89.99, stock: 60, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80' },
        { name: 'Wireless Gaming Mouse', description: 'Ultra-lightweight with 25,600 DPI sensor and 70-hour battery.', price: 79.99, stock: 45, category: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80' },
        { name: 'Standing Desk', description: 'Height-adjustable electric standing desk with memory presets.', price: 649.99, stock: 10, category: 'Furniture', imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80' },
        { name: 'True Wireless Earbuds', description: 'Active noise cancelling with 36-hour total battery life.', price: 179.99, stock: 55, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80' },
        { name: 'Fitness Tracker Band', description: 'Sleep tracking, heart rate monitor, and 14-day battery.', price: 59.99, stock: 80, category: 'Wearables', imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80' },
        { name: 'USB-C Hub 10-in-1', description: 'Dual 4K HDMI, 100W PD charging, SD card reader and more.', price: 69.99, stock: 30, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&q=80' },
        { name: 'Laptop Stand Adjustable', description: 'Aluminium foldable laptop stand for improved ergonomics.', price: 39.99, stock: 0, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80' },
      ],
    });
    console.log('✅ Products seeded');
  }
};

// Build Prisma where clause from query params
const buildWhereClause = (query) => {
  const { search, category, minPrice, maxPrice, inStock } = query;
  const where = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category && category !== 'All') {
    where.category = category;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
  }
  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }
  return where;
};

const buildOrderBy = (sortBy) => {
  switch (sortBy) {
    case 'price_asc':  return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'name_asc':   return { name: 'asc' };
    case 'name_desc':  return { name: 'desc' };
    default:           return { createdAt: 'desc' };
  }
};

const getProducts = async (req, res) => {
  try {
    await seedProducts();
    const { search, category, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 12 } = req.query;
    const where = buildWhereClause(req.query);
    const orderBy = buildOrderBy(sortBy);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / take) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Admin Routes ---
const validateProductInput = (body) => {
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    return 'Name must be a non-empty string';
  }
  if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) {
    return 'Price must be a non-negative number';
  }
  if (body.stock !== undefined && (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)) {
    return 'Stock must be a non-negative integer';
  }
  if (body.category !== undefined && typeof body.category !== 'string') {
    return 'Category must be a string';
  }
  return null;
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof price === 'undefined' || !Number.isFinite(Number(price))) {
      return res.status(400).json({ message: 'Name and a valid price are required' });
    }
    const validationError = validateProductInput({ name, price, stock, category });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    const product = await prisma.product.create({
      data: { name, description: description || '', price: parseFloat(price), stock: parseInt(stock) || 0, imageUrl, category: category || 'General' },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;
    const data = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(category !== undefined && { category }),
    };
    const validationError = validateProductInput({ name: data.name, price: data.price, stock: data.stock, category: data.category });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Soft delete: sets deletedAt timestamp instead of removing record
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { deletedAt: new Date() },
    });
    res.json({ message: 'Product soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: get all products including soft-deleted
const getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await prisma.product.count();
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) });
    res.json({ products, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllProductsAdmin };
