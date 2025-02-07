import { testUserEndpoints } from './users.test';
import { testAccountEndpoints } from './accounts.test';
import { testPaymentEndpoints } from './payments.test';

async function runAllTests() {
  console.log('Starting API Tests...');
  console.log('Make sure your local server is running on http://localhost:3000');

  await testUserEndpoints();
  await testAccountEndpoints();
  await testPaymentEndpoints();

  console.log('\nAll tests completed!');
}

runAllTests().catch(console.error); 