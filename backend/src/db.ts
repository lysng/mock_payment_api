import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { Payment, User, Account } from './types';
import { promisify } from 'util';

class DB {
  private db: Database;
  public get: (sql: string, params: any[]) => Promise<any>;
  public run: (sql: string, params: any[]) => Promise<any>;
  public all: (sql: string, params: any[]) => Promise<any[]>;

  constructor() {
    this.db = new sqlite3.Database('payments.db');
    this.init().catch(console.error);

    // Promisify SQLite methods
    this.get = promisify(this.db.get.bind(this.db));
    this.run = promisify(this.db.run.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  private async init() {
    await this.createTables();
    try {
      await this.addBalanceColumn();
    } catch (error) {
      // Column might already exist, ignore the error
    }
  }

  // User operations
  async createUser(user: User): Promise<string> {
    return new Promise((resolve, reject) => {
      const { userId, firstName, lastName, email, dateOfBirth, address } = user;
      const { street, city, country, postalCode } = address;
      
      this.db.run(
        `INSERT INTO users (userId, firstName, lastName, email, dateOfBirth, street, city, country, postalCode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, email, dateOfBirth, street, city, country, postalCode],
        (err) => {
          if (err) reject(err);
          if (!userId) reject(new Error('userId is undefined'));
          else resolve(userId);
        }
      );
    });
  }

  async getUser(userId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE userId = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? this.mapRowToUser(row) : null);
        }
      );
    });
  }

  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM users`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(this.mapRowToUser));
        }
      );
    });
  }

  async updateUser(userId: string, updatedData: Partial<User>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      if (updatedData.firstName) {
        fields.push('firstName = ?');
        values.push(updatedData.firstName);
      }
      if (updatedData.lastName) {
        fields.push('lastName = ?');
        values.push(updatedData.lastName);
      }
      if (updatedData.email) {
        fields.push('email = ?');
        values.push(updatedData.email);
      }
      if (updatedData.dateOfBirth) {
        fields.push('dateOfBirth = ?');
        values.push(updatedData.dateOfBirth);
      }
      if (updatedData.address) {
        if (updatedData.address.street) {
          fields.push('street = ?');
          values.push(updatedData.address.street);
        }
        if (updatedData.address.city) {
          fields.push('city = ?');
          values.push(updatedData.address.city);
        }
        if (updatedData.address.country) {
          fields.push('country = ?');
          values.push(updatedData.address.country);
        }
        if (updatedData.address.postalCode) {
          fields.push('postalCode = ?');
          values.push(updatedData.address.postalCode);
        }
      }

      if (fields.length === 0) {
        resolve();
        return;
      }

      values.push(userId);

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE userId = ?`;

      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM users WHERE userId = ?`,
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  private mapRowToUser(row: any): User {
    return {
      userId: row.userId,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      dateOfBirth: row.dateOfBirth,
      address: {
        street: row.street,
        city: row.city,
        country: row.country,
        postalCode: row.postalCode,
      },
    };
  }

  // Account operations
  async getAccount(accountId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM accounts WHERE accountId = ?`,
        [accountId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async updateAccount(accountId: string, updateData: Partial<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.accountType) {
        fields.push('accountType = ?');
        values.push(updateData.accountType);
      }
      if (updateData.currency) {
        fields.push('currency = ?');
        values.push(updateData.currency);
      }

      if (fields.length === 0) {
        resolve();
        return;
      }

      values.push(accountId);
      const sql = `UPDATE accounts SET ${fields.join(', ')} WHERE accountId = ?`;

      this.db.run(sql, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  async createAccount(account: Account): Promise<string> {
    return new Promise((resolve, reject) => {
      const { accountId, accountNumber, userId, balance, status, createdAt } = account;
      
      this.db.run(
        `INSERT INTO accounts (accountId, accountNumber, userId, balance, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [accountId, accountNumber, userId, balance || 0, status || 'active', createdAt || new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve(accountId);
        }
      );
    });
  }

  async closeAccount(accountId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE accounts SET status = 'CLOSED' WHERE accountId = ?`,
        [accountId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Payment operations
  async createPayment(payment: Payment): Promise<string> {
    return new Promise((resolve, reject) => {
      const { paymentId, amount, fromAccount, toAccount, status, transactionDate } = payment;

      this.db.run(
        `INSERT INTO payments (paymentId, amount, fromAccount, toAccount, status, transactionDate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [paymentId, amount, fromAccount, toAccount, status || 'pending', transactionDate || new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve(paymentId);
        }
      );
    });
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM payments WHERE paymentId = ?`,
        [paymentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? this.mapRowToPayment(row) : null);
        }
      );
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM payments`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(this.mapRowToPayment));
        }
      );
    });
  }

  async updatePayment(paymentId: string, updateData: Partial<Payment>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.amount) {
        fields.push('amount = ?');
        values.push(updateData.amount);
      }
      if (updateData.fromAccount) {
        fields.push('fromAccount = ?');
        values.push(updateData.fromAccount);
      }
      if (updateData.toAccount) {
        fields.push('toAccount = ?');
        values.push(updateData.toAccount);
      }
      if (updateData.status) {
        fields.push('status = ?');
        values.push(updateData.status);
      }

      if (fields.length === 0) {
        resolve();
        return;
      }

      values.push(paymentId);
      const sql = `UPDATE payments SET ${fields.join(', ')} WHERE paymentId = ?`;

      this.db.run(sql, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deletePayment(paymentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM payments WHERE paymentId = ?`,
        [paymentId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  private mapRowToPayment(row: any): Payment {
    return {
      paymentId: row.paymentId,
      amount: row.amount,
      fromAccount: row.fromAccount,
      toAccount: row.toAccount,
      status: row.status,
      transactionDate: row.transactionDate
    };
  }

  private async createTables(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.serialize(() => {
        // Users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            dateOfBirth TEXT NOT NULL,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            country TEXT NOT NULL,
            postalCode TEXT NOT NULL
          )
        `);

        // Accounts table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS accounts (
            accountId TEXT PRIMARY KEY,
            accountNumber TEXT UNIQUE,
            userId TEXT,
            balance REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            createdAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(userId)
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });

        // Payments table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS payments (
            paymentId TEXT PRIMARY KEY,
            amount REAL NOT NULL,
            fromAccount TEXT NOT NULL,
            toAccount TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'completed', 'failed')) NOT NULL,
            transactionDate TEXT NOT NULL,
            FOREIGN KEY(fromAccount) REFERENCES accounts(accountId),
            FOREIGN KEY(toAccount) REFERENCES accounts(accountId)
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  private mapRowToAccount(row: any): Account {
    return {
      accountId: row.accountId,
      accountNumber: row.accountNumber,
      userId: row.userId,
      balance: row.balance,
      status: row.status,
      createdAt: row.createdAt
    };
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT p.* FROM payments p
         JOIN accounts a ON p.fromAccount = a.accountId OR p.toAccount = a.accountId
         WHERE a.userId = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(this.mapRowToPayment));
        }
      );
    });
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM accounts WHERE userId = ?`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(this.mapRowToAccount));
        }
      );
    });
  }

  async addBalanceColumn(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(`
        ALTER TABLE accounts 
        ADD COLUMN balance REAL DEFAULT 0
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const db = new DB();
export default db;