import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CertificateViewer } from './certificate-viewer'
import { getCertificateAPI } from '@/blockchain/api/certificate-api'
import { useState } from 'react'
import { Download, Share2, ExternalLink, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { CertificateData } from '@/blockchain/types/certificate-types'

interface CertificateModalProps {
  certificate: CertificateData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CertificateModal({ certificate, open, onOpenChange }: CertificateModalProps) {
  const [verifying, setVerifying] = useState(false)
  const { toast } = useToast()

  if (!certificate) return null

  const handleDownload = () => {
    // Convert certificate to PDF or print
    window.print()
  }

  const handleShare = async () => {
    const shareData = {
      title: `Certificate: ${certificate.courseName}`,
      text: `I've earned a certificate in ${certificate.courseName}!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url || '')
        toast({
          title: "Link copied to clipboard",
          description: "You can now share your certificate link.",
        })
      }
    } else {
      await navigator.clipboard.writeText(shareData.url || '')
      toast({
        title: "Link copied to clipboard",
        description: "You can now share your certificate link.",
      })
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const api = await getCertificateAPI()
      const result = await api.verifyCertificate(certificate.certificateId)
      
      if (result.isValid) {
        toast({
          title: "Certificate Verified",
          description: result.blockchainConfirmed 
            ? "Certificate is verified on the blockchain."
            : "Certificate is valid in our database.",
        })
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Certificate could not be verified.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Unable to verify certificate at this time.",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Certificate Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <CertificateViewer 
            certificate={certificate}
            showVerification={!!certificate.blockchainTxId}
          />
          
          <div className="flex flex-wrap gap-3 justify-center pt-6 border-t">
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Certificate
            </Button>
            
            <Button onClick={handleVerify} disabled={verifying}>
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verify on Blockchain
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}