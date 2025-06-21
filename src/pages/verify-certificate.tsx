import { CertificateVerificationWidget } from '@/components/certificates/certificate-verification-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'

export function VerifyCertificatePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Certificate Verification</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify the authenticity of Orion Path certificates using blockchain technology. 
            Enter a certificate ID to instantly verify its validity and authenticity.
          </p>
        </div>

        {/* Verification Widget */}
        <CertificateVerificationWidget />

        {/* How It Works Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              How Certificate Verification Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="font-semibold mb-2">Enter Certificate ID</h3>
                <p className="text-sm text-muted-foreground">
                  Provide the unique certificate ID found on the certificate document.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <h3 className="font-semibold mb-2">Blockchain Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Our system checks the certificate against the Algorand blockchain for authenticity.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get immediate verification results with certificate details and authenticity status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Security & Privacy Notice
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Certificate verification is performed using public blockchain data</li>
                  <li>• No personal information is stored or transmitted during verification</li>
                  <li>• All verifications are logged for transparency and audit purposes</li>
                  <li>• Only valid certificates issued through Orion Path can be verified</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Learn more about our certification process.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="/certificates" className="text-primary hover:underline">
              View Certificate Gallery
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="/courses" className="text-primary hover:underline">
              Browse Courses
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="/" className="text-primary hover:underline">
              About Orion Path
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}