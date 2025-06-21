import algosdk from 'algosdk';
import { BlockchainConfig } from '../types/certificate-types';

export const getBlockchainConfig = (): BlockchainConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    network: isProduction ? 'mainnet' : 'testnet',
    algodServer: process.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    algodPort: 443,
    algodToken: process.env.VITE_ALGOD_TOKEN || '',
    appId: parseInt(process.env.VITE_CERTIFICATE_APP_ID || '0'),
    creatorAddress: process.env.VITE_CREATOR_ADDRESS || '',
    creatorMnemonic: process.env.VITE_CREATOR_MNEMONIC || ''
  };
};

export const createAlgodClient = (): algosdk.Algodv2 => {
  const config = getBlockchainConfig();
  
  return new algosdk.Algodv2(
    config.algodToken,
    config.algodServer,
    config.algodPort
  );
};

export const validateBlockchainConfig = (): void => {
  const config = getBlockchainConfig();
  
  if (!config.algodServer) {
    throw new Error('VITE_ALGOD_SERVER environment variable is required');
  }
  
  if (!config.creatorAddress) {
    throw new Error('VITE_CREATOR_ADDRESS environment variable is required');
  }
  
  if (!config.creatorMnemonic) {
    throw new Error('VITE_CREATOR_MNEMONIC environment variable is required');
  }
  
  // Validate mnemonic
  try {
    algosdk.mnemonicToSecretKey(config.creatorMnemonic);
  } catch (error) {
    throw new Error('Invalid creator mnemonic provided');
  }
  
  if (config.appId === 0) {
    console.warn('Certificate app ID not set - contract needs to be deployed');
  }
};

export const getNetworkInfo = () => {
  const config = getBlockchainConfig();
  
  return {
    network: config.network,
    explorerUrl: config.network === 'mainnet' 
      ? 'https://explorer.perawallet.app'
      : 'https://testnet.explorer.perawallet.app',
    faucetUrl: config.network === 'testnet' 
      ? 'https://bank.testnet.algorand.network'
      : undefined
  };
};