#!/usr/bin/env node

import { BlockchainClientFactory } from '../src/blockchain/client/blockchain-client-factory';
import { validateBlockchainConfig } from '../src/blockchain/config/blockchain-config';

async function deployContract() {
  try {
    console.log('🚀 Starting certificate contract deployment...');
    
    // Validate configuration
    console.log('📋 Validating blockchain configuration...');
    validateBlockchainConfig();
    console.log('✅ Configuration validated');

    // Deploy contract
    console.log('🔗 Deploying contract to Algorand...');
    const appId = await BlockchainClientFactory.deployContract();
    
    console.log('🎉 Contract deployed successfully!');
    console.log(`📄 Application ID: ${appId}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Update your environment variables:');
    console.log(`VITE_CERTIFICATE_APP_ID=${appId}`);
    console.log('');
    console.log('🔍 You can view your contract on the explorer:');
    console.log(`https://testnet.explorer.perawallet.app/application/${appId}`);
    
  } catch (error) {
    console.error('❌ Contract deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deployContract();