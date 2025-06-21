export interface CertificateData {
  certificateId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  score: number;
  maxScore: number;
  examinationDate: string;
  transcriptHash: string;
  metadata: CertificateMetadata;
  issuerAddress: string;
  timestamp: number;
  status: 'active' | 'revoked';
  blockchainTxId?: string;
}

export interface CertificateMetadata {
  examinationType: 'quiz' | 'assessment' | 'final';
  modulesCompleted: number;
  totalModules: number;
  completionTime: number; // in minutes
  difficultyLevel: number;
  keywords: string[];
  learningObjectives: string[];
  passingScore: number;
  achievementLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ExaminationTranscript {
  studentId: string;
  courseId: string;
  moduleResults: ModuleResult[];
  totalScore: number;
  maxPossibleScore: number;
  completionDate: string;
  timeSpent: number;
  examType: 'practice' | 'final';
}

export interface ModuleResult {
  moduleIndex: number;
  moduleName: string;
  score: number;
  maxScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  topics: TopicResult[];
}

export interface TopicResult {
  topicIndex: number;
  topicName: string;
  score: number;
  maxScore: number;
  understanding: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificateData?: CertificateData;
  error?: string;
  verificationTimestamp: number;
  blockchainConfirmed: boolean;
}

export interface BlockchainConfig {
  network: 'mainnet' | 'testnet' | 'sandbox';
  algodServer: string;
  algodPort: number;
  algodToken: string;
  appId: number;
  creatorAddress: string;
  creatorMnemonic: string;
}