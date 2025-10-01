#!/usr/bin/env node

/**
 * Quick test to verify backend fixes are working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testBackendHealth() {
    console.log('🔍 Testing backend health after fixes...\n');

    try {
        // Test 1: Basic health check
        console.log('1. Testing basic API health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ API is responding\n');

        // Test 2: Test series endpoint
        console.log('2. Testing test series endpoint...');
        try {
            const testSeriesResponse = await axios.get(`${BASE_URL}/test-series`);
            console.log('✅ Test series endpoint working\n');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Test series endpoint working (requires auth)\n');
            } else {
                throw error;
            }
        }

        // Test 3: Quiz endpoint
        console.log('3. Testing quiz endpoint...');
        try {
            const quizResponse = await axios.get(`${BASE_URL}/quizzes`);
            console.log('✅ Quiz endpoint working\n');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Quiz endpoint working (requires auth)\n');
            } else {
                throw error;
            }
        }

        console.log('🎉 All basic tests passed! Backend appears to be working correctly.');
        console.log('\n💡 To run full tests with authentication:');
        console.log('   1. Get an admin token from the web interface');
        console.log('   2. Run: node test-course-testseries-relationship.js');

    } catch (error) {
        console.error('❌ Backend test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Backend might not be running. Try:');
            console.log('   ./restart-backend.sh');
        }

        process.exit(1);
    }
}

testBackendHealth();