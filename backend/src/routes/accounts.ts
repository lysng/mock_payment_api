import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../types';
import db from '../db';

const accounts = new Hono();

accounts.post('/', async (c) => {
  const accountData: Partial<Account> = await c.req.json();
  
  try {
    const accountId = uuidv4();
    const accountNumber = Math.random().toString(36).slice(2, 10).toUpperCase();
    
    await db.run(`
      INSERT INTO accounts (accountId, accountNumber, userId, balance, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      accountId,
      accountNumber,
      accountData.userId,
      accountData.balance || 0,
      'active',
      new Date().toISOString()
    ]);

    const newAccount = await db.get(
      'SELECT * FROM accounts WHERE accountId = ?',
      [accountId]
    );

    return c.json({ 
      accountId: newAccount.accountId,
      accountNumber: newAccount.accountNumber,
      status: newAccount.status,
      balance: newAccount.balance
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

accounts.get('/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const userAccounts = await db.all(
      'SELECT * FROM accounts WHERE userId = ?',
      [userId]
    );
    return c.json(userAccounts);
  } catch (error) {
    return c.json({ error: 'Failed to fetch user accounts' }, 500);
  }
});

accounts.get('/:accountId', async (c) => {
  const accountId = c.req.param('accountId');
  try {
    const account = await db.get(
      'SELECT * FROM accounts WHERE accountId = ?',
      [accountId]
    );
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }
    return c.json(account);
  } catch (error) {
    return c.json({ error: 'Failed to fetch account' }, 500);
  }
});

accounts.put('/:accountId', async (c) => {
  const accountId = c.req.param('accountId');
  const updateData = await c.req.json();
  
  try {
    await db.run(
      'UPDATE accounts SET status = ? WHERE accountId = ?',
      [updateData.status, accountId]
    );

    const updatedAccount = await db.get(
      'SELECT * FROM accounts WHERE accountId = ?',
      [accountId]
    );

    return c.json({ 
      accountId: updatedAccount.accountId,
      accountNumber: updatedAccount.accountNumber,
      status: updatedAccount.status,
      message: 'Account updated successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to update account' }, 500);
  }
});

accounts.delete('/:accountId', async (c) => {
  const accountId = c.req.param('accountId');
  
  try {
    await db.run(
      'UPDATE accounts SET status = ? WHERE accountId = ?',
      ['closed', accountId]
    );

    const closedAccount = await db.get(
      'SELECT * FROM accounts WHERE accountId = ?',
      [accountId]
    );

    return c.json({ 
      accountId: closedAccount.accountId,
      accountNumber: closedAccount.accountNumber,
      status: closedAccount.status,
      message: 'Account closed successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to close account' }, 500);
  }
});

export { accounts as accountsRouter };