import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import db from '../db';
import { generateDummyUser } from '../utils/ollama';
import { z } from 'zod';
import { schemas } from '../utils/openApiGenerator';

const users = new Hono();

// POST - Create a new user
users.post('/', async (c) => {
  const userData = await c.req.json();
  const validatedData = schemas.userSchema.parse(userData);
  const userId = uuidv4();

  try {
    await db.createUser({
      ...validatedData,
      userId,
    });
    return c.json({ 
      userId, 
      status: 'created'
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// GET - Retrieve all users
users.get('/', async (c) => {
  try {
    const allUsers = await db.getAllUsers();
    return c.json(allUsers, 200);
  } catch (error) {
    return c.json({ error: 'Failed to retrieve users' }, 500);
  }
});

// GET - Retrieve a single user by userId
users.get('/:userId', async (c) => {
  const { userId } = c.req.param();
  
  try {
    const user = await db.getUser(userId);
    if (user) {
      return c.json(user, 200);
    } else {
      return c.json({ error: 'User not found' }, 404);
    }
  } catch (error) {
    return c.json({ error: 'Failed to retrieve user' }, 500);
  }
});

// PUT - Update a user by userId
users.put('/:userId', async (c) => {
  const { userId } = c.req.param();
  const updatedData: Partial<User> = await c.req.json();

  try {
    const user = await db.getUser(userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    await db.updateUser(userId, updatedData);
    return c.json({ status: 'updated' }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// DELETE - Remove a user by userId
users.delete('/:userId', async (c) => {
  const { userId } = c.req.param();

  try {
    const user = await db.getUser(userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    await db.deleteUser(userId);
    return c.json({ status: 'deleted' }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Add this new endpoint to usersRouter
users.get('/:userId/payments', async (c) => {
  const { userId } = c.req.param();
  
  try {
    const payments = await db.getPaymentsByUserId(userId);
    return c.json(payments, 200);
  } catch (error) {
    return c.json({ error: 'Failed to retrieve user payments' }, 500);
  }
});

users.get('/:userId/accounts', async (c) => {
  const { userId } = c.req.param();
  
  try {
    const accounts = await db.getAccountsByUserId(userId);
    return c.json(accounts, 200);
  } catch (error) {
    return c.json({ error: 'Failed to retrieve user accounts' }, 500);
  }
});

// Add this new endpoint before the export statement
users.post('/generate', async (c) => {
  try {
    const dummyUser = await generateDummyUser();
    const userId = uuidv4();
    
    await db.createUser({
      userId,
      ...dummyUser
    });

    return c.json({ 
      userId,
      ...dummyUser,
      status: 'created'
    }, 201);
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return c.json({ 
      error: 'Failed to generate and create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { users as usersRouter };