import { CertificateContract } from '../contracts/certificate-contract';
import { CertificateService } from '../services/certificate-service';
import { getBlockchainConfig, createAlgodClient, validateBlockchainConfig } from '../config/blockchain-config';

export class BlockchainClientFactory {
  private static certificateService: CertificateService | null = null;
  private static contract: CertificateContract | null = null;

  static async createCertificateService(): Promise<CertificateService> {
    if (this.certificateService) {
      return this.certificateService;
    }

    try {
      validateBlockchainConfig();
      
      const config = getBlockchainConfig();
      const algodClient = createAlgodClient();

      // Create contract instance
      const contract = new CertificateContract(
        algodClient,
        config.appId,
        config.creatorMnemonic
      );

      this.contract = contract;

      // Create service instance
      this.certificateService = new CertificateService(contract);

      return this.certificateService;
    } catch (error) {
      console.error('Failed to create certificate service:', error);
      throw new Error(`Certificate service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deployContract(): Promise<number> {
    try {
      validateBlockchainConfig();
      
      const config = getBlockchainConfig();
      const algodClient = createAlgodClient();

      const contract = new CertificateContract(
        algodClient,
        0, // Will be set after deployment
        config.creatorMnemonic
      );

      const appId = await contract.deployContract();
      console.log(`Certificate contract deployed with app ID: ${appId}`);
      
      return appId;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getContractInfo(): Promise<{
    appId: number;
    totalCertificates: number;
    network: string;
  }> {
    try {
      const config = getBlockchainConfig();
      
      if (!this.contract && config.appId > 0) {
        const algodClient = createAlgodClient();
        this.contract = new CertificateContract(
          algodClient,
          config.appId,
          config.creatorMnemonic
        );
      }

      const totalCertificates = this.contract 
        ? await this.contract.getTotalCertificates()
        : 0;

      return {
        appId: config.appId,
        totalCertificates,
        network: config.network
      };
    } catch (error) {
      console.error('Failed to get contract info:', error);
      return {
        appId: 0,
        totalCertificates: 0,
        network: 'unknown'
      };
    }
  }

  static reset(): void {
    this.certificateService = null;
    this.contract = null;
  }
}