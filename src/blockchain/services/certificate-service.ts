import { CertificateContract } from '../contracts/certificate-contract';
import { CertificateData, ExaminationTranscript, CertificateVerificationResult } from '../types/certificate-types';
import { dbOperations } from '@/lib/supabase';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

export class CertificateService {
  private contract: CertificateContract;

  constructor(contract: CertificateContract) {
    this.contract = contract;
  }

  async generateCertificate(
    studentId: string,
    courseId: string,
    transcript: ExaminationTranscript
  ): Promise<CertificateData> {
    // Generate unique certificate ID
    const certificateId = uuidv4();
    
    // Create transcript hash
    const transcriptHash = this.createTranscriptHash(transcript);
    
    // Get course details
    const course = await dbOperations.getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Calculate score percentage and achievement level
    const scorePercentage = Math.round((transcript.totalScore / transcript.maxPossibleScore) * 100);
    const achievementLevel = this.calculateAchievementLevel(scorePercentage);
    
    // Create certificate metadata
    const metadata = {
      examinationType: transcript.examType === 'final' ? 'final' : 'assessment',
      modulesCompleted: transcript.moduleResults.length,
      totalModules: course.syllabus?.modules?.length || 0,
      completionTime: transcript.timeSpent,
      difficultyLevel: course.depth,
      keywords: course.syllabus?.keywords || [],
      learningObjectives: this.extractLearningObjectives(course.syllabus),
      passingScore: 70, // 70% passing grade
      achievementLevel
    } as const;

    const certificateData: CertificateData = {
      certificateId,
      studentId,
      courseId,
      courseName: course.topic,
      score: transcript.totalScore,
      maxScore: transcript.maxPossibleScore,
      examinationDate: transcript.completionDate,
      transcriptHash,
      metadata,
      issuerAddress: '', // Will be set when issued on blockchain
      timestamp: Date.now(),
      status: 'active'
    };

    // Store in database
    await this.storeCertificateInDatabase(certificateData, transcript);
    
    return certificateData;
  }

  async issueCertificateOnBlockchain(
    studentAddress: string,
    certificateData: CertificateData
  ): Promise<string> {
    try {
      const txId = await this.contract.issueCertificate(studentAddress, certificateData);
      
      // Update certificate with blockchain transaction ID
      await this.updateCertificateTransaction(certificateData.certificateId, txId);
      
      return txId;
    } catch (error) {
      console.error('Failed to issue certificate on blockchain:', error);
      throw new Error(`Blockchain issuance failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async revokeCertificate(
    certificateId: string,
    studentAddress: string
  ): Promise<string> {
    try {
      const txId = await this.contract.revokeCertificate(studentAddress);
      
      // Update database status
      await this.updateCertificateStatus(certificateId, 'revoked');
      
      return txId;
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      throw new Error(`Certificate revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyCertificate(
    studentAddress: string,
    certificateId: string
  ): Promise<CertificateVerificationResult> {
    try {
      // First check blockchain verification
      const blockchainResult = await this.contract.verifyCertificate(studentAddress, certificateId);
      
      if (blockchainResult.isValid && blockchainResult.certificateData) {
        // Enhance with database information
        const dbCertificate = await this.getCertificateById(certificateId);
        if (dbCertificate) {
          blockchainResult.certificateData = {
            ...blockchainResult.certificateData,
            ...dbCertificate
          };
        }
      }
      
      return blockchainResult;
    } catch (error) {
      // Fallback to database verification
      console.warn('Blockchain verification failed, falling back to database:', error);
      return this.verifyFromDatabase(certificateId);
    }
  }

  async getCertificateHistory(studentId: string): Promise<CertificateData[]> {
    try {
      const { data, error } = await dbOperations.supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch certificate history: ${error.message}`);
      }

      return (data || []).map(this.mapDbToCertificate);
    } catch (error) {
      console.error('Error fetching certificate history:', error);
      throw error;
    }
  }

  async getCertificateById(certificateId: string): Promise<CertificateData | null> {
    try {
      const { data, error } = await dbOperations.supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch certificate: ${error.message}`);
      }

      return data ? this.mapDbToCertificate(data) : null;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return null;
    }
  }

  async getCourseCompletionStats(courseId: string): Promise<{
    totalCertificates: number;
    averageScore: number;
    achievementDistribution: Record<string, number>;
  }> {
    try {
      const { data, error } = await dbOperations.supabase
        .from('certificates')
        .select('score, max_score, metadata')
        .eq('course_id', courseId)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to fetch course stats: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          totalCertificates: 0,
          averageScore: 0,
          achievementDistribution: { bronze: 0, silver: 0, gold: 0, platinum: 0 }
        };
      }

      const totalCertificates = data.length;
      const totalScore = data.reduce((sum, cert) => sum + (cert.score / cert.max_score * 100), 0);
      const averageScore = Math.round(totalScore / totalCertificates);

      const achievementDistribution = data.reduce((dist, cert) => {
        const level = cert.metadata?.achievementLevel || 'bronze';
        dist[level] = (dist[level] || 0) + 1;
        return dist;
      }, { bronze: 0, silver: 0, gold: 0, platinum: 0 });

      return {
        totalCertificates,
        averageScore,
        achievementDistribution
      };
    } catch (error) {
      console.error('Error fetching course completion stats:', error);
      throw error;
    }
  }

  private async storeCertificateInDatabase(
    certificateData: CertificateData,
    transcript: ExaminationTranscript
  ): Promise<void> {
    const { error } = await dbOperations.supabase
      .from('certificates')
      .insert({
        certificate_id: certificateData.certificateId,
        student_id: certificateData.studentId,
        course_id: certificateData.courseId,
        course_name: certificateData.courseName,
        score: certificateData.score,
        max_score: certificateData.maxScore,
        examination_date: certificateData.examinationDate,
        transcript_hash: certificateData.transcriptHash,
        transcript_data: transcript,
        metadata: certificateData.metadata,
        issuer_address: certificateData.issuerAddress,
        timestamp: certificateData.timestamp,
        status: certificateData.status
      });

    if (error) {
      throw new Error(`Failed to store certificate in database: ${error.message}`);
    }
  }

  private async updateCertificateTransaction(certificateId: string, txId: string): Promise<void> {
    const { error } = await dbOperations.supabase
      .from('certificates')
      .update({ blockchain_tx_id: txId })
      .eq('certificate_id', certificateId);

    if (error) {
      console.error('Failed to update certificate transaction:', error);
    }
  }

  private async updateCertificateStatus(certificateId: string, status: string): Promise<void> {
    const { error } = await dbOperations.supabase
      .from('certificates')
      .update({ status })
      .eq('certificate_id', certificateId);

    if (error) {
      throw new Error(`Failed to update certificate status: ${error.message}`);
    }
  }

  private async verifyFromDatabase(certificateId: string): Promise<CertificateVerificationResult> {
    const certificate = await this.getCertificateById(certificateId);
    
    if (!certificate) {
      return {
        isValid: false,
        error: 'Certificate not found',
        verificationTimestamp: Date.now(),
        blockchainConfirmed: false
      };
    }

    return {
      isValid: certificate.status === 'active',
      certificateData: certificate,
      verificationTimestamp: Date.now(),
      blockchainConfirmed: false
    };
  }

  private createTranscriptHash(transcript: ExaminationTranscript): string {
    const transcriptString = JSON.stringify({
      studentId: transcript.studentId,
      courseId: transcript.courseId,
      totalScore: transcript.totalScore,
      maxPossibleScore: transcript.maxPossibleScore,
      completionDate: transcript.completionDate,
      moduleResults: transcript.moduleResults.map(mr => ({
        moduleIndex: mr.moduleIndex,
        score: mr.score,
        maxScore: mr.maxScore
      }))
    });
    
    return CryptoJS.SHA256(transcriptString).toString();
  }

  private calculateAchievementLevel(scorePercentage: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (scorePercentage >= 95) return 'platinum';
    if (scorePercentage >= 85) return 'gold';
    if (scorePercentage >= 75) return 'silver';
    return 'bronze';
  }

  private extractLearningObjectives(syllabus: any): string[] {
    if (!syllabus?.modules) return [];
    
    const objectives: string[] = [];
    syllabus.modules.forEach((module: any) => {
      module.topics?.forEach((topic: any) => {
        if (topic.content) {
          const learningObjMatch = topic.content.match(/Learning Objectives[:\s]*([^#]+)/i);
          if (learningObjMatch) {
            objectives.push(learningObjMatch[1].trim());
          }
        }
      });
    });
    
    return objectives.slice(0, 5); // Limit to 5 objectives
  }

  private mapDbToCertificate(dbData: any): CertificateData {
    return {
      certificateId: dbData.certificate_id,
      studentId: dbData.student_id,
      courseId: dbData.course_id,
      courseName: dbData.course_name,
      score: dbData.score,
      maxScore: dbData.max_score,
      examinationDate: dbData.examination_date,
      transcriptHash: dbData.transcript_hash,
      metadata: dbData.metadata || {},
      issuerAddress: dbData.issuer_address || '',
      timestamp: dbData.timestamp || Date.now(),
      status: dbData.status || 'active',
      blockchainTxId: dbData.blockchain_tx_id
    };
  }
}