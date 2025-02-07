import { generateDummyUser } from '../utils/ollama';
import chalk from 'chalk';  // Add this package for colored output

export const API_BASE = 'http://localhost:3000/api/v1';

// Enhanced logging helpers
export function logTestHeader(title: string) {
    console.log('\n' + chalk.blue.bold(`🔍 Testing ${title}...`));
    console.log(chalk.blue('='.repeat(50)));
}

export function logOperation(description: string) {
    console.log('\n' + chalk.cyan(`▶ ${description}`));
}

export function logDetail(label: string, value: any) {
    console.log(chalk.gray(`  ${label}:`), chalk.white(value));
}

export function logTestResult(testName: string, passed: boolean, details?: any) {
    const icon = passed ? chalk.green('✅') : chalk.red('❌');
    console.log('\n' + chalk.yellow(`Test: ${testName}`));
    console.log(`Result: ${icon} ${passed ? 'PASSED' : 'FAILED'}`);
    if (details) {
        console.log('Details:', details);
    }
}

export function logError(error: any) {
    console.error(chalk.red('\n❌ Test failed:'), error);
}

// Helper functions
export async function createTestUser(role: 'sender' | 'receiver' = 'sender') {
    const userData = await generateDummyUser(role);
    const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const { userId } = await response.json();
    return { userId, ...userData };
}

export async function createTestAccount(userId: string, initialBalance: number = 0) {
    const response = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            balance: initialBalance
        })
    });
    return response.json();
}

// Format currency helper
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
} 