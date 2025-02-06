import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../types';
import db from '../db';

const accounts = new Hono();

accounts.post('/', async (c) => {
  const accountData: Partial<Account> = await c.req.json();
  
  try {
    // First validate the user exists
    const userExists = await db.getUser(accountData.userId as string);
    if (!userExists) {
      return c.json({ error: 'User not found' }, 404);
    }

    const newAccount: Account = {
      accountId: uuidv4(),
      accountNumber: Math.random().toString(36).slice(2).toUpperCase(),
      userId: accountData.userId as string,
      balance: accountData.balance || 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (!newAccount.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    await db.createAccount(newAccount);
    return c.json({ 
      accountId: newAccount.accountId, 
      accountNumber: newAccount.accountNumber,
      status: newAccount.status 
    }, 201);
  } catch (error) {
    console.error('Account creation error:', error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

accounts.get('/:accountId', async (c) => {
  const { accountId } = c.req.param();
  try {
    const account = await db.getAccount(accountId);
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }
    return c.json(account);
  } catch (error) {
    return c.json({ error: 'Failed to fetch account' }, 500);
  }
});

accounts.put('/:accountId', async (c) => {
  const { accountId } = c.req.param();
  const updateData = await c.req.json();
  try {
    await db.updateAccount(accountId, updateData);
    return c.json({ status: 'updated' });
  } catch (error) {
    return c.json({ error: 'Failed to update account' }, 500);
  }
});

accounts.delete('/:accountId', async (c) => {
  const { accountId } = c.req.param();
  try {
    await db.closeAccount(accountId);
    return c.json({ 
      status: 'closed',
      closureDate: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: 'Failed to close account' }, 500);
  }
});

export { accounts as accountsRouter };