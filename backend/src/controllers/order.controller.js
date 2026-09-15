const prisma = require('../utils/prisma');

const MAX_QUANTITY = 99;

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems, paymentMethod, paymentIntentId } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      const productIds = cartItems.map((item) => Number(item.id));
      if (productIds.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw badRequest('Invalid product in cart');
      }

      const products = await tx.product.findMany({
        where: { id: { in: productIds }, deletedAt: null },
      });
      if (products.length !== productIds.length) {
        throw badRequest('One or more products are unavailable');
      }

      const itemCreates = [];
      let computedTotal = 0;

      for (const item of cartItems) {
        const product = products.find((p) => p.id === Number(item.id));
        if (!product) throw badRequest(`Product not found`);
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty <= 0 || qty > MAX_QUANTITY) {
          throw badRequest(`Invalid quantity for ${product.name}`);
        }
        if (product.stock < qty) {
          throw badRequest(`Insufficient stock for ${product.name}`);
        }
        computedTotal += product.price * qty;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qty } },
        });
        itemCreates.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          imageUrl: product.imageUrl,
        });
      }

      const isStripe = paymentMethod === 'stripe';
      let paymentConfirmed = false;

      if (isStripe && paymentIntentId) {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.amount !== Math.round(computedTotal * 100)) {
          throw badRequest('Payment amount does not match order total');
        }
        paymentConfirmed = pi.status === 'succeeded';
      } else if (isStripe) {
        throw badRequest('Missing paymentIntentId');
      }

      const orderData = {
        userId,
        totalAmount: computedTotal,
        paymentMethod: paymentMethod || 'cod',
        status: isStripe ? (paymentConfirmed ? 'paid' : 'pending') : 'cod',
        paymentStatus: isStripe ? (paymentConfirmed ? 'paid' : 'unpaid') : 'paid',
        trackingNumber,
        paymentIntentId: paymentIntentId || null,
        items: { create: itemCreates },
      };

      return tx.order.create({ data: orderData });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
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

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      const OR = [];
      const numId = parseInt(search);
      if (!isNaN(numId)) OR.push({ id: numId });
      OR.push({ trackingNumber: { contains: search, mode: 'insensitive' } });
      where.OR = OR;
    }

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } }, items: true },
      skip,
      take: parseInt(limit),
    });
    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;

    const orderId = parseInt(id);
    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const data = {};
    if (status !== undefined) {
      const validStatuses = ['pending', 'paid', 'cod', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      data.status = status;
    }
    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['paid', 'unpaid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      data.paymentStatus = paymentStatus;
    }
    if (trackingNumber !== undefined && trackingNumber !== null) {
      data.trackingNumber = String(trackingNumber).slice(0, 64);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { items: true },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createOrder, getOrders, getAllOrders, updateOrderStatus };