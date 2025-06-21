import algosdk from 'algosdk';
import { CertificateData, CertificateVerificationResult } from '../types/certificate-types';

export class CertificateContract {
  private algodClient: algosdk.Algodv2;
  private appId: number;
  private creatorAccount: algosdk.Account;

  constructor(
    algodClient: algosdk.Algodv2,
    appId: number,
    creatorMnemonic: string
  ) {
    this.algodClient = algodClient;
    this.appId = appId;
    this.creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  }

  // Deploy the smart contract
  async deployContract(): Promise<number> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    
    // Create application with approval and clear programs
    const approvalProgram = await this.compileProgram(this.createApprovalProgram());
    const clearProgram = await this.compileProgram(this.createClearProgram());
    
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: this.creatorAccount.addr,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram,
      clearProgram,
      globalSchema: {
        numUint: 2, // Total certificates issued, contract version
        numByteSlice: 1 // Contract metadata
      },
      localSchema: {
        numUint: 5, // timestamp, score, max_score, status, achievement_level
        numByteSlice: 4 // student_id, certificate_id, course_id, metadata_hash
      }
    });

    const signedTxn = txn.signTxn(this.creatorAccount.sk);
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation and get app ID
    const confirmation = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return confirmation['application-index'];
  }

  // Create approval program (TEAL)
  private createApprovalProgram(): string {
    return `#pragma version 8

// Check if this is a create transaction
txn ApplicationID
int 0
==
bnz create

// Check if this is an opt-in transaction
txn OnCompletion
int OptIn
==
bnz optin

// Handle application calls
txn ApplicationArgs 0
byte "issue"
==
bnz issue_certificate

txn ApplicationArgs 0
byte "revoke"
==
bnz revoke_certificate

txn ApplicationArgs 0
byte "verify"
==
bnz verify_certificate

// Default: reject
err

create:
  // Initialize global state
  byte "total_certs"
  int 0
  app_global_put
  
  byte "version"
  int 1
  app_global_put
  
  int 1
  return

optin:
  // Allow opt-in
  int 1
  return

issue_certificate:
  // Verify creator is authorized issuer
  txn Sender
  global CreatorAddress
  ==
  assert
  
  // Store certificate data in local state
  txn ApplicationArgs 1  // certificate_id
  byte "cert_id"
  app_local_put
  
  txn ApplicationArgs 2  // student_id  
  byte "student_id"
  app_local_put
  
  txn ApplicationArgs 3  // course_id
  byte "course_id"
  app_local_put
  
  txn ApplicationArgs 4  // score
  btoi
  byte "score"
  app_local_put
  
  txn ApplicationArgs 5  // max_score
  btoi
  byte "max_score"
  app_local_put
  
  txn ApplicationArgs 6  // metadata_hash
  byte "metadata_hash"
  app_local_put
  
  txn ApplicationArgs 7  // achievement_level (0=bronze, 1=silver, 2=gold, 3=platinum)
  btoi
  byte "achievement_level"
  app_local_put
  
  global LatestTimestamp
  byte "timestamp"
  app_local_put
  
  int 1  // status = active
  byte "status"
  app_local_put
  
  // Increment total certificates
  byte "total_certs"
  byte "total_certs"
  app_global_get
  int 1
  +
  app_global_put
  
  int 1
  return

revoke_certificate:
  // Verify creator is authorized
  txn Sender
  global CreatorAddress
  ==
  assert
  
  // Set status to revoked
  int 0  // status = revoked
  byte "status"
  app_local_put
  
  int 1
  return

verify_certificate:
  // Anyone can verify a certificate
  txn Accounts 1
  byte "status"
  app_local_get_ex
  store 0 // exists flag
  store 1 // status value
  
  load 0 // check if exists
  assert
  
  load 1 // check if active (1 = active, 0 = revoked)
  return

int 1
return`;
  }

  private createClearProgram(): string {
    return `#pragma version 8
int 1
return`;
  }

  private async compileProgram(source: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const programBytes = encoder.encode(source);
    const compileResponse = await this.algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
  }

  // Issue certificate
  async issueCertificate(
    studentAddress: string,
    certificateData: CertificateData
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    
    // Calculate achievement level based on score
    const scorePercentage = (certificateData.score / certificateData.maxScore) * 100;
    let achievementLevel = 0; // bronze
    if (scorePercentage >= 95) achievementLevel = 3; // platinum
    else if (scorePercentage >= 85) achievementLevel = 2; // gold
    else if (scorePercentage >= 75) achievementLevel = 1; // silver

    const appArgs = [
      new Uint8Array(Buffer.from('issue')),
      new Uint8Array(Buffer.from(certificateData.certificateId)),
      new Uint8Array(Buffer.from(certificateData.studentId)),
      new Uint8Array(Buffer.from(certificateData.courseId)),
      algosdk.encodeUint64(certificateData.score),
      algosdk.encodeUint64(certificateData.maxScore),
      new Uint8Array(Buffer.from(certificateData.transcriptHash)),
      algosdk.encodeUint64(achievementLevel)
    ];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: this.creatorAccount.addr,
      appIndex: this.appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs,
      accounts: [studentAddress],
      suggestedParams
    });

    const signedTxn = txn.signTxn(this.creatorAccount.sk);
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return txId;
  }

  // Revoke certificate
  async revokeCertificate(studentAddress: string): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    
    const appArgs = [
      new Uint8Array(Buffer.from('revoke'))
    ];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: this.creatorAccount.addr,
      appIndex: this.appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs,
      accounts: [studentAddress],
      suggestedParams
    });

    const signedTxn = txn.signTxn(this.creatorAccount.sk);
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return txId;
  }

  // Verify certificate
  async verifyCertificate(
    studentAddress: string,
    certificateId: string
  ): Promise<CertificateVerificationResult> {
    try {
      const accountInfo = await this.algodClient.accountInformation(studentAddress).do();
      const localState = accountInfo['apps-local-state']?.find(
        (app: any) => app.id === this.appId
      );

      if (!localState) {
        return {
          isValid: false,
          error: 'No certificate found for this address',
          verificationTimestamp: Date.now(),
          blockchainConfirmed: false
        };
      }

      const certData = this.parseLocalState(localState);
      
      if (certData.certificateId !== certificateId) {
        return {
          isValid: false,
          error: 'Certificate ID mismatch',
          verificationTimestamp: Date.now(),
          blockchainConfirmed: false
        };
      }

      if (certData.status === 'revoked') {
        return {
          isValid: false,
          error: 'Certificate has been revoked',
          verificationTimestamp: Date.now(),
          blockchainConfirmed: true
        };
      }

      return {
        isValid: true,
        certificateData: certData,
        verificationTimestamp: Date.now(),
        blockchainConfirmed: true
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        verificationTimestamp: Date.now(),
        blockchainConfirmed: false
      };
    }
  }

  private parseLocalState(localState: any): CertificateData {
    const keyValue = localState['key-value'] || [];
    const getValue = (key: string) => keyValue.find((kv: any) => 
      Buffer.from(kv.key, 'base64').toString() === key
    );

    const achievementLevels = ['bronze', 'silver', 'gold', 'platinum'];
    const achievementLevel = this.decodeUint(getValue('achievement_level'));

    return {
      certificateId: this.decodeBytes(getValue('cert_id')),
      studentId: this.decodeBytes(getValue('student_id')),
      courseId: this.decodeBytes(getValue('course_id')),
      courseName: '', // Will be filled from database
      score: this.decodeUint(getValue('score')),
      maxScore: this.decodeUint(getValue('max_score')),
      examinationDate: '', // Will be filled from database
      transcriptHash: this.decodeBytes(getValue('metadata_hash')),
      metadata: {
        achievementLevel: achievementLevels[achievementLevel] as any
      } as any,
      timestamp: this.decodeUint(getValue('timestamp')),
      status: this.decodeUint(getValue('status')) === 1 ? 'active' : 'revoked',
      issuerAddress: ''
    };
  }

  private decodeBytes(keyValue: any): string {
    if (!keyValue?.value?.bytes) return '';
    return Buffer.from(keyValue.value.bytes, 'base64').toString();
  }

  private decodeUint(keyValue: any): number {
    return keyValue?.value?.uint || 0;
  }

  // Get total certificates issued
  async getTotalCertificates(): Promise<number> {
    try {
      const appInfo = await this.algodClient.getApplicationByID(this.appId).do();
      const globalState = appInfo.params['global-state'] || [];
      const totalCerts = globalState.find((kv: any) => 
        Buffer.from(kv.key, 'base64').toString() === 'total_certs'
      );
      return totalCerts?.value?.uint || 0;
    } catch (error) {
      console.error('Error getting total certificates:', error);
      return 0;
    }
  }
}