import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../types';
import db from '../db';

const payments = new Hono();

payments.post('/', async (c) => {
  try {
    const { amount, fromAccount, toAccount } = await c.req.json();
    
    // Check account and balance
    const fromAccountData = await db.get('SELECT balance FROM accounts WHERE accountId = ? AND status = "active"', [fromAccount]);
    if (!fromAccountData) throw new Error('Source account not found or inactive');
    if (fromAccountData.balance < amount) throw new Error('Insufficient funds');

    // Update balances
    await db.run('UPDATE accounts SET balance = balance - ? WHERE accountId = ?', [amount, fromAccount]);
    await db.run('UPDATE accounts SET balance = balance + ? WHERE accountId = ?', [amount, toAccount]);

    // Create payment record
    const paymentId = uuidv4();
    await db.run(
      'INSERT INTO payments (paymentId, amount, fromAccount, toAccount, status, transactionDate) VALUES (?, ?, ?, ?, ?, ?)',
      [paymentId, amount, fromAccount, toAccount, 'completed', new Date().toISOString()]
    );

    return c.json({
      paymentId,
      status: 'completed',
      transactionDate: new Date().toISOString()
    }, 201);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

payments.get('/:paymentId', async (c) => {
  const paymentId = c.req.param('paymentId');
  
  try {
    const payment = await db.getPayment(paymentId);
    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }
    return c.json(payment);
  } catch (error) {
    return c.json({ error: 'Failed to retrieve payment' }, 500);
  }
});

payments.get('/', async (c) => {
  try {
    const payments = await db.getAllPayments();
    return c.json(payments);
  } catch (error) {
    return c.json({ error: 'Failed to retrieve payments' }, 500);
  }
});

payments.put('/:paymentId', async (c) => {
  const paymentId = c.req.param('paymentId');
  const updateData: Partial<Payment> = await c.req.json();
  
  try {
    await db.updatePayment(paymentId, updateData);
    return c.json({ message: 'Payment updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update payment' }, 500);
  }
});

payments.delete('/:paymentId', async (c) => {
  const paymentId = c.req.param('paymentId');
  
  try {
    await db.deletePayment(paymentId);
    return c.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete payment' }, 500);
  }
});

export { payments as paymentsRouter };