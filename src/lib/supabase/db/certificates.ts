import { supabase } from '../index';
import { CertificateData, ExaminationTranscript } from '@/blockchain/types/certificate-types';

export const certificateOperations = {
  async createCertificate(
    certificateData: CertificateData,
    transcript: ExaminationTranscript
  ): Promise<void> {
    const { error } = await supabase
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
      throw new Error(`Failed to create certificate: ${error.message}`);
    }
  },

  async getCertificatesByStudent(studentId: string): Promise<CertificateData[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch certificates: ${error.message}`);
    }

    return (data || []).map(this.mapDbToCertificate);
  },

  async getCertificateById(certificateId: string): Promise<CertificateData | null> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch certificate: ${error.message}`);
    }

    return data ? this.mapDbToCertificate(data) : null;
  },

  async updateCertificateTransaction(certificateId: string, txId: string): Promise<void> {
    const { error } = await supabase
      .from('certificates')
      .update({ blockchain_tx_id: txId })
      .eq('certificate_id', certificateId);

    if (error) {
      throw new Error(`Failed to update certificate transaction: ${error.message}`);
    }
  },

  async updateCertificateStatus(certificateId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('certificates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('certificate_id', certificateId);

    if (error) {
      throw new Error(`Failed to update certificate status: ${error.message}`);
    }
  },

  async getCertificateStats(courseId: string): Promise<{
    totalCertificates: number;
    averageScore: number;
    achievementDistribution: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('certificates')
      .select('score, max_score, metadata')
      .eq('course_id', courseId)
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to fetch certificate stats: ${error.message}`);
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
  },

  async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  },

  async createUserProfile(userId: string, algorandAddress?: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        algorand_address: algorandAddress
      });

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  },

  async updateUserAlgorandAddress(userId: string, algorandAddress: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        algorand_address: algorandAddress
      });

    if (error) {
      throw new Error(`Failed to update Algorand address: ${error.message}`);
    }
  },

  mapDbToCertificate(dbData: any): CertificateData {
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
};