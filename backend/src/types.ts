export interface User {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export interface Account {
  accountId: string;
  accountNumber: string;
  userId: string;
  balance: number;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface Payment {
  paymentId: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  status: 'pending' | 'completed' | 'failed';
  transactionDate: string;
}