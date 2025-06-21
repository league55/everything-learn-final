import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CertificateViewer } from './certificate-viewer';
import { getCertificateAPI } from '@/blockchain/api/certificate-api';
import { CertificateVerificationResult } from '@/blockchain/types/certificate-types';
import { Shield, ShieldCheck, ShieldX, Loader2, Search } from 'lucide-react';

export function CertificateVerificationWidget() {
  const [certificateId, setCertificateId] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const api = await getCertificateAPI();
      const result = await api.verifyCertificate(
        certificateId.trim(),
        studentAddress.trim() || undefined
      );
      
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationIcon = () => {
    if (!verificationResult) return <Shield className="h-5 w-5" />;
    
    if (verificationResult.isValid) {
      return verificationResult.blockchainConfirmed 
        ? <ShieldCheck className="h-5 w-5 text-green-500" />
        : <ShieldCheck className="h-5 w-5 text-blue-500" />;
    }
    
    return <ShieldX className="h-5 w-5 text-red-500" />;
  };

  const getVerificationMessage = () => {
    if (!verificationResult) return null;

    if (verificationResult.isValid) {
      return (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            <span className="font-semibold">Certificate Verified!</span>
            <br />
            {verificationResult.blockchainConfirmed 
              ? 'This certificate is confirmed on the Algorand blockchain.'
              : 'This certificate is valid in our database but not yet confirmed on blockchain.'
            }
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          <span className="font-semibold">Verification Failed:</span>
          <br />
          {verificationResult.error || 'Certificate is not valid'}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getVerificationIcon()}
            Certificate Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificate-id">Certificate ID *</Label>
              <Input
                id="certificate-id"
                placeholder="Enter certificate ID"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-address">
                Student Address (Optional)
                <Badge variant="outline" className="ml-2 text-xs">
                  Blockchain verification
                </Badge>
              </Label>
              <Input
                id="student-address"
                placeholder="Algorand address for blockchain verification"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={loading || !certificateId.trim()}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Verify Certificate
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {getVerificationMessage()}

          {verificationResult && (
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Verification completed at:</span>
                <span>{new Date(verificationResult.verificationTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={verificationResult.blockchainConfirmed ? "default" : "secondary"}>
                  {verificationResult.blockchainConfirmed ? 'Blockchain Confirmed' : 'Database Only'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {verificationResult?.isValid && verificationResult.certificateData && (
        <CertificateViewer 
          certificate={verificationResult.certificateData}
          showVerification={verificationResult.blockchainConfirmed}
        />
      )}
    </div>
  );
}