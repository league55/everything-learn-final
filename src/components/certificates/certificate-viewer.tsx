import React from 'react';
import { CertificateData } from '@/blockchain/types/certificate-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, User, BookOpen, Hash, ExternalLink, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CertificateViewerProps {
  certificate: CertificateData;
  showVerification?: boolean;
  showActions?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
  onVerify?: () => void;
}

export function CertificateViewer({ 
  certificate, 
  showVerification = false,
  showActions = false,
  onDownload,
  onShare,
  onVerify
}: CertificateViewerProps) {
  const scorePercentage = Math.round((certificate.score / certificate.maxScore) * 100);
  const achievementLevel = certificate.metadata?.achievementLevel || 'bronze';

  const achievementColors = {
    bronze: 'from-amber-600 to-orange-600',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-indigo-600'
  };

  const achievementBadgeColors = {
    bronze: 'bg-amber-100 text-amber-800 border-amber-200',
    silver: 'bg-gray-100 text-gray-800 border-gray-200',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    platinum: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="relative overflow-hidden border-2 border-border bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Decorative gradient overlay */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-2 bg-gradient-to-r",
          achievementColors[achievementLevel]
        )} />
        
        <CardHeader className="text-center border-b border-border/50 pb-8">
          {/* Achievement Level Badge */}
          <div className="flex justify-center mb-4">
            <Badge className={cn("text-sm font-semibold px-4 py-2", achievementBadgeColors[achievementLevel])}>
              {achievementLevel.toUpperCase()} CERTIFICATE
            </Badge>
          </div>

          {/* Award Icon */}
          <div className="flex justify-center mb-6">
            <div className={cn(
              "p-4 rounded-full bg-gradient-to-br shadow-lg",
              achievementColors[achievementLevel]
            )}>
              <Award className="h-16 w-16 text-white" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Certificate of Completion
          </CardTitle>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This is to certify that
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Student Information */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Student ID: {certificate.studentId}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">has successfully completed</p>
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h4 className="text-2xl font-bold text-primary">
                {certificate.courseName}
              </h4>
            </div>
          </div>

          {/* Achievement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {scorePercentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {certificate.metadata.modulesCompleted}/{certificate.metadata.totalModules}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(certificate.metadata.completionTime / 60)}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {certificate.metadata.difficultyLevel}/5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="space-y-4 mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Completed:</span>
              <span>{new Date(certificate.examinationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Certificate ID:</span>
              <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {certificate.certificateId}
              </span>
            </div>
            {certificate.blockchainTxId && (
              <div className="flex items-center gap-3 text-sm">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Blockchain TX:</span>
                <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {certificate.blockchainTxId.slice(0, 16)}...
                </span>
              </div>
            )}
          </div>

          {/* Learning Objectives */}
          {certificate.metadata.learningObjectives?.length > 0 && (
            <div className="mb-8">
              <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Learning Objectives Achieved:
              </h5>
              <div className="space-y-2">
                {certificate.metadata.learningObjectives.slice(0, 3).map((objective, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockchain Verification */}
          {showVerification && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Blockchain Verified</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                This certificate is stored on the Algorand blockchain and can be verified publicly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex flex-wrap gap-3 justify-center pt-6 border-t border-border/50">
              {onDownload && (
                <Button onClick={onDownload} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
              {onShare && (
                <Button onClick={onShare} variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Certificate
                </Button>
              )}
              {onVerify && (
                <Button onClick={onVerify} className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Verify on Blockchain
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}