import { useState } from 'react'
import { CertificateCard } from './certificate-card'
import { CertificateModal } from './certificate-modal'
import type { CertificateData } from '@/blockchain/types/certificate-types'
import { Award } from 'lucide-react'

interface CertificatesGridProps {
  certificates: CertificateData[]
  emptyMessage?: string
}

export function CertificatesGrid({ certificates, emptyMessage = "No certificates found." }: CertificatesGridProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null)

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
          <Award className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.certificateId}
            certificate={certificate}
            onClick={() => setSelectedCertificate(certificate)}
          />
        ))}
      </div>

      <CertificateModal
        certificate={selectedCertificate}
        open={!!selectedCertificate}
        onOpenChange={(open) => !open && setSelectedCertificate(null)}
      />
    </>
  )
}