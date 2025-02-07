import { API_BASE, createTestUser, createTestAccount, logTestResult, logTestHeader, logOperation, logDetail, logError, formatCurrency } from './helpers';

export async function testAccountEndpoints() {
    logTestHeader('Account Endpoints');

    try {
        // Create test user
        logOperation('Creating test user');
        const userData = await createTestUser();
        logDetail('User', `${userData.firstName} ${userData.lastName}`);
        logDetail('User ID', userData.userId);

        // Test Create Account
        logOperation('Creating new account');
        const accountData = await createTestAccount(userData.userId, 1000);
        logDetail('Account Number', accountData.accountNumber);
        logDetail('Initial Balance', formatCurrency(accountData.balance));
        logTestResult('Create Account', !!accountData.accountId);

        // Test Get Account
        logOperation(`Fetching account details`);
        const getAccountResponse = await fetch(`${API_BASE}/accounts/${accountData.accountId}`);
        const account = await getAccountResponse.json();
        logDetail('Balance', formatCurrency(account.balance));
        logDetail('Status', account.status);
        logTestResult('Get Account', account.accountId === accountData.accountId);

        // Test Get User's Accounts
        logOperation(`Fetching all accounts for user ${userData.firstName}`);
        const getUserAccountsResponse = await fetch(`${API_BASE}/users/${userData.userId}/accounts`);
        const userAccounts = await getUserAccountsResponse.json();
        logDetail('Number of Accounts', userAccounts.length);
        logTestResult('Get User Accounts', Array.isArray(userAccounts));

        // Test Update Account Status
        logOperation(`Updating account ${accountData.accountNumber} status to inactive`);
        const updateResponse = await fetch(`${API_BASE}/accounts/${accountData.accountId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'inactive'
            })
        });
        const updateResult = await updateResponse.json();
        logDetail('Updated Status', updateResult.status);
        logTestResult('Update Account', updateResult.status === 'inactive');

        // Test Close Account
        logOperation(`Closing account ${accountData.accountNumber}`);
        const closeResponse = await fetch(`${API_BASE}/accounts/${accountData.accountId}`, {
            method: 'DELETE'
        });
        const closeResult = await closeResponse.json();
        logDetail('Closure Response', closeResult.message);
        logTestResult('Close Account', closeResult.status === 'closed');

        // Verify account is closed
        logOperation(`Verifying account ${accountData.accountNumber} closure`);
        const closedAccountResponse = await fetch(`${API_BASE}/accounts/${accountData.accountId}`);
        const closedAccount = await closedAccountResponse.json();
        logDetail('Final Status', closedAccount.status);
        logTestResult('Account Status', closedAccount.status === 'closed');

    } catch (error) {
        logError(error);
    }
} 