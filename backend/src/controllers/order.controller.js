const prisma = require('../utils/prisma');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems, paymentMethod, paymentIntentId } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    let paymentConfirmed = false;
    if (paymentMethod === 'stripe' && paymentIntentId) {
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentConfirmed = pi.status === 'succeeded';
    }

    const orderData = {
      userId,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      status: paymentMethod === 'stripe' ? (paymentConfirmed ? 'paid' : 'pending') : 'cod',
      paymentStatus: paymentMethod === 'stripe' ? (paymentConfirmed ? 'paid' : 'unpaid') : 'paid',
      trackingNumber,
      paymentIntentId: paymentIntentId || null,
      items: {
        create: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
      },
    };

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({ data: orderData });
      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.id}`);
        }
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return createdOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await prisma.order.count({ where: { userId: req.user.id } });
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      skip,
      take: parseInt(limit),
    });
    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createOrder, getOrders };