import { CertificateService } from '../services/certificate-service';
import { CertificateData, ExaminationTranscript, CertificateVerificationResult } from '../types/certificate-types';
import { BlockchainClientFactory } from '../client/blockchain-client-factory';
import { dbOperations } from '@/lib/supabase';

export class CertificateAPI {
  private certificateService: CertificateService;

  constructor(certificateService: CertificateService) {
    this.certificateService = certificateService;
  }

  // Called when a student completes a course examination
  async onExaminationCompletion(
    studentId: string,
    courseId: string,
    examinationResults: any
  ): Promise<CertificateData> {
    try {
      // Check if student has already received a certificate for this course
      const existingCertificates = await this.certificateService.getCertificateHistory(studentId);
      const courseAlreadyCertified = existingCertificates.some(
        cert => cert.courseId === courseId && cert.status === 'active'
      );

      if (courseAlreadyCertified) {
        throw new Error('Student has already received a certificate for this course');
      }

      // Create examination transcript
      const transcript: ExaminationTranscript = {
        studentId,
        courseId,
        moduleResults: examinationResults.moduleResults || [],
        totalScore: examinationResults.totalScore || 0,
        maxPossibleScore: examinationResults.maxPossibleScore || 100,
        completionDate: new Date().toISOString(),
        timeSpent: examinationResults.timeSpent || 0,
        examType: examinationResults.examType || 'final'
      };

      // Check minimum passing score (70%)
      const scorePercentage = (transcript.totalScore / transcript.maxPossibleScore) * 100;
      if (scorePercentage < 70) {
        throw new Error(`Score of ${scorePercentage.toFixed(1)}% is below the required 70% passing grade`);
      }

      // Generate certificate
      const certificateData = await this.certificateService.generateCertificate(
        studentId,
        courseId,
        transcript
      );

      // Issue on blockchain (if possible)
      const studentProfile = await this.getUserProfile(studentId);
      if (studentProfile?.algorand_address) {
        try {
          const txId = await this.certificateService.issueCertificateOnBlockchain(
            studentProfile.algorand_address,
            certificateData
          );
          
          console.log(`Certificate issued on blockchain: ${txId}`);
        } catch (error) {
          console.error('Failed to issue certificate on blockchain:', error);
          // Certificate still valid in database, can be issued later
        }
      }

      return certificateData;
    } catch (error) {
      console.error('Error in examination completion:', error);
      throw error;
    }
  }

  // Get student's certificate history
  async getStudentCertificates(studentId: string): Promise<CertificateData[]> {
    try {
      return await this.certificateService.getCertificateHistory(studentId);
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      throw new Error('Failed to fetch student certificates');
    }
  }

  // Verify a certificate
  async verifyCertificate(
    certificateId: string,
    studentAddress?: string
  ): Promise<CertificateVerificationResult> {
    try {
      const certificate = await this.certificateService.getCertificateById(certificateId);
      
      if (!certificate) {
        return {
          isValid: false,
          error: 'Certificate not found',
          verificationTimestamp: Date.now(),
          blockchainConfirmed: false
        };
      }

      if (studentAddress) {
        // Full blockchain verification
        return await this.certificateService.verifyCertificate(studentAddress, certificateId);
      } else {
        // Database-only verification
        return {
          isValid: certificate.status === 'active',
          certificateData: certificate,
          verificationTimestamp: Date.now(),
          blockchainConfirmed: false
        };
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        isValid: false,
        error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        verificationTimestamp: Date.now(),
        blockchainConfirmed: false
      };
    }
  }

  // Revoke a certificate (admin only)
  async revokeCertificate(
    certificateId: string,
    studentAddress: string,
    reason: string
  ): Promise<string> {
    try {
      const txId = await this.certificateService.revokeCertificate(certificateId, studentAddress);
      
      // Log revocation reason
      await this.logCertificateAction(certificateId, 'revoked', reason);
      
      return txId;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw new Error(`Certificate revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get certificate by ID
  async getCertificateById(certificateId: string): Promise<CertificateData | null> {
    try {
      return await this.certificateService.getCertificateById(certificateId);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return null;
    }
  }

  // Get course completion statistics
  async getCourseStats(courseId: string): Promise<{
    totalCertificates: number;
    averageScore: number;
    achievementDistribution: Record<string, number>;
  }> {
    try {
      return await this.certificateService.getCourseCompletionStats(courseId);
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return {
        totalCertificates: 0,
        averageScore: 0,
        achievementDistribution: { bronze: 0, silver: 0, gold: 0, platinum: 0 }
      };
    }
  }

  // Issue certificate on blockchain for existing certificate
  async issueCertificateOnBlockchain(
    certificateId: string,
    studentAddress: string
  ): Promise<string> {
    try {
      const certificate = await this.certificateService.getCertificateById(certificateId);
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      if (certificate.blockchainTxId) {
        throw new Error('Certificate already issued on blockchain');
      }

      const txId = await this.certificateService.issueCertificateOnBlockchain(
        studentAddress,
        certificate
      );

      return txId;
    } catch (error) {
      console.error('Error issuing certificate on blockchain:', error);
      throw error;
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await dbOperations.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private async logCertificateAction(
    certificateId: string,
    action: string,
    details: string
  ): Promise<void> {
    try {
      const { error } = await dbOperations.supabase
        .from('certificate_logs')
        .insert({
          certificate_id: certificateId,
          action,
          details,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log certificate action:', error);
      }
    } catch (error) {
      console.error('Error logging certificate action:', error);
    }
  }
}

// Factory function to create API instance
export async function createCertificateAPI(): Promise<CertificateAPI> {
  try {
    const certificateService = await BlockchainClientFactory.createCertificateService();
    return new CertificateAPI(certificateService);
  } catch (error) {
    console.error('Failed to create certificate API:', error);
    throw error;
  }
}

// Singleton instance for global use
let globalCertificateAPI: CertificateAPI | null = null;

export async function getCertificateAPI(): Promise<CertificateAPI> {
  if (!globalCertificateAPI) {
    globalCertificateAPI = await createCertificateAPI();
  }
  return globalCertificateAPI;
}