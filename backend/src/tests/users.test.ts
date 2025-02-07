import { API_BASE, createTestUser, logTestResult, logTestHeader } from './helpers';

export async function testUserEndpoints() {
    logTestHeader('User Endpoints');

    try {
        // Test Create User
        const userData = await createTestUser();
        logTestResult('Create User', !!userData.userId);

        // Test Get User
        const getUserResponse = await fetch(`${API_BASE}/users/${userData.userId}`);
        const user = await getUserResponse.json();
        logTestResult('Get User', user.userId === userData.userId);

        // Test Update User
        const updateResponse = await fetch(`${API_BASE}/users/${userData.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'UpdatedName'
            })
        });
        logTestResult('Update User', updateResponse.status === 200);

        // Test Get All Users
        const getAllResponse = await fetch(`${API_BASE}/users`);
        const users = await getAllResponse.json();
        logTestResult('Get All Users', Array.isArray(users));

        // Test Delete User
        const deleteResponse = await fetch(`${API_BASE}/users/${userData.userId}`, {
            method: 'DELETE'
        });
        logTestResult('Delete User', deleteResponse.status === 200);

    } catch (error) {
        console.error('User tests failed:', error);
    }
} 