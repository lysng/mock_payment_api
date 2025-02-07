import { API_BASE, createTestUser, createTestAccount, logTestHeader, logOperation, logDetail, logTestResult, logError, formatCurrency } from './helpers';

export async function testPaymentEndpoints() {
    logTestHeader('Payment Operations');

    try {
        // Setup
        logOperation('Setting up test accounts');
        const sender = await createTestUser('sender');
        const receiver = await createTestUser('receiver');
        logDetail('Sender', `${sender.firstName} ${sender.lastName}`);
        logDetail('Receiver', `${receiver.firstName} ${receiver.lastName}`);

        const senderAccount = await createTestAccount(sender.userId, 1000);
        const receiverAccount = await createTestAccount(receiver.userId, 0);
        logDetail('Sender Initial Balance', formatCurrency(senderAccount.balance));
        logDetail('Receiver Initial Balance', formatCurrency(receiverAccount.balance));

        // Test Payment
        logOperation('Executing payment transaction');
        const paymentAmount = 500;
        logDetail('Amount', formatCurrency(paymentAmount));
        logDetail('From Account', senderAccount.accountNumber);
        logDetail('To Account', receiverAccount.accountNumber);

        // Test Create Payment
        const paymentResponse = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 500,
                fromAccount: senderAccount.accountId,
                toAccount: receiverAccount.accountId,
                transactionDate: new Date().toISOString()
            })
        });
        const payment = await paymentResponse.json();
        logTestResult('Create Payment', payment.status === 'completed');

        // Verify balances
        const senderAccountAfter = await fetch(`${API_BASE}/accounts/${senderAccount.accountId}`);
        const receiverAccountAfter = await fetch(`${API_BASE}/accounts/${receiverAccount.accountId}`);

        const { balance: senderBalance } = await senderAccountAfter.json();
        const { balance: receiverBalance } = await receiverAccountAfter.json();

        logTestResult('Payment Balances',
            senderBalance === 500 && receiverBalance === 500,
            { senderBalance, receiverBalance }
        );

        // Test Get Payment
        const getPaymentResponse = await fetch(`${API_BASE}/payments/${payment.paymentId}`);
        const retrievedPayment = await getPaymentResponse.json();
        logTestResult('Get Payment', retrievedPayment.paymentId === payment.paymentId);

        // Test Get All Payments
        const getAllResponse = await fetch(`${API_BASE}/payments`);
        const payments = await getAllResponse.json();
        logTestResult('Get All Payments', Array.isArray(payments));

    } catch (error) {
        logError(error);
    }
} 