import { generateDummyUser } from '../utils/ollama';
import { logTestHeader } from './helpers';

const API_BASE = 'http://localhost:3000/api/v1';

async function testTransaction() {
    logTestHeader('Transaction Endpoints');

    try {
        // 1. Generate two users with different roles
        console.log('Generating users...');
        const sender = await generateDummyUser('sender');
        const receiver = await generateDummyUser('receiver');

        // 2. Create users via API
        const senderResponse = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sender)
        });
        const { userId: senderId } = await senderResponse.json();
        console.log(`Created sender: ${sender.firstName} ${sender.lastName} (${senderId})`);

        const receiverResponse = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receiver)
        });
        const { userId: receiverId } = await receiverResponse.json();
        console.log(`Created receiver: ${receiver.firstName} ${receiver.lastName} (${receiverId})`);

        // 3. Create accounts for both users
        const senderAccountResponse = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: senderId,
                balance: 1000 // Initial balance for sender
            })
        });
        const { accountId: senderAccountId } = await senderAccountResponse.json();
        console.log(`Created sender account: ${senderAccountId} with balance: 1000`);

        const receiverAccountResponse = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: receiverId,
                balance: 0 // Initial balance for receiver
            })
        });
        const { accountId: receiverAccountId } = await receiverAccountResponse.json();
        console.log(`Created receiver account: ${receiverAccountId} with balance: 0`);

        // 4. Execute payment transaction
        const paymentAmount = 500;
        console.log(`\nExecuting payment of ${paymentAmount} from ${senderAccountId} to ${receiverAccountId}`);

        const paymentResponse = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: paymentAmount,
                fromAccount: senderAccountId,
                toAccount: receiverAccountId,
                transactionDate: new Date().toISOString()
            })
        });
        const payment = await paymentResponse.json();

        // 5. Verify account balances
        const senderAccountAfter = await fetch(`${API_BASE}/accounts/${senderAccountId}`);
        const receiverAccountAfter = await fetch(`${API_BASE}/accounts/${receiverAccountId}`);

        const { balance: senderBalance } = await senderAccountAfter.json();
        const { balance: receiverBalance } = await receiverAccountAfter.json();

        // Assert results
        console.log('\nTest Results:');
        console.log('-------------');
        console.log(`Sender (${sender.firstName} ${sender.lastName}) balance: ${senderBalance}`);
        console.log(`Receiver (${receiver.firstName} ${receiver.lastName}) balance: ${receiverBalance}`);
        console.log(`Payment status: ${payment.status}`);

        const passed = senderBalance === 500 && receiverBalance === 500;
        console.log(`\nTest ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);

        if (!passed) {
            console.error('Expected: sender=500, receiver=500');
            console.error(`Got: sender=${senderBalance}, receiver=${receiverBalance}`);
        }

    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test
console.log('Make sure your local server is running on http://localhost:3000');
testTransaction().catch(console.error); 