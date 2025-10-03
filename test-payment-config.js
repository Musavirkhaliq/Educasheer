// Test script to verify payment gateway configuration
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api/v1';

async function testPaymentConfig() {
    try {
        console.log('🔍 Testing Payment Gateway Configuration...\n');
        
        // Test payment gateway status
        const statusResponse = await axios.get(`${API_BASE}/payments/status`);
        
        if (statusResponse.data.success) {
            const { razorpay, stripe, defaultGateway } = statusResponse.data.data;
            
            console.log('📊 Payment Gateway Status:');
            console.log('─'.repeat(40));
            
            console.log(`🔹 Default Gateway: ${defaultGateway}`);
            console.log('\n🔸 Razorpay:');
            console.log(`   ✓ Configured: ${razorpay.configured ? '✅' : '❌'}`);
            console.log(`   ✓ Has Key ID: ${razorpay.hasKeyId ? '✅' : '❌'}`);
            console.log(`   ✓ Has Key Secret: ${razorpay.hasKeySecret ? '✅' : '❌'}`);
            
            console.log('\n🔸 Stripe:');
            console.log(`   ✓ Configured: ${stripe.configured ? '✅' : '❌'}`);
            console.log(`   ✓ Has Secret Key: ${stripe.hasSecretKey ? '✅' : '❌'}`);
            console.log(`   ✓ Has Publishable Key: ${stripe.hasPublishableKey ? '✅' : '❌'}`);
            
            console.log('\n' + '─'.repeat(40));
            
            if (!razorpay.configured && !stripe.configured) {
                console.log('⚠️  No payment gateways configured - Running in DEMO MODE');
                console.log('📝 To configure payment gateways:');
                console.log('   1. Add Razorpay credentials to .env file');
                console.log('   2. Add Stripe credentials to .env file');
                console.log('   3. Restart the server');
            } else {
                console.log('✅ Payment gateways are properly configured!');
            }
        } else {
            console.log('❌ Failed to get payment gateway status');
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend server is not running');
            console.log('💡 Start the backend server with: npm run dev');
        } else {
            console.log('❌ Error testing payment configuration:', error.message);
        }
    }
}

// Run the test
testPaymentConfig();