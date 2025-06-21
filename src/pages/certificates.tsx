import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { CertificatesGrid } from '@/components/certificates/certificates-grid'
import { CertificatesFilters } from '@/components/certificates/certificates-filters'
import { BlockchainBenefits } from '@/components/certificates/blockchain-benefits'
import { EmptyCertificatesState } from '@/components/certificates/empty-certificates-state'
import { getCertificateAPI } from '@/blockchain/api/certificate-api'
import type { CertificateData } from '@/blockchain/types/certificate-types'
import { Loader2, Award, Shield, Search } from 'lucide-react'

interface CertificatesFilters {
  search: string
  status: 'all' | 'active' | 'revoked'
  dateRange: 'all' | 'recent' | 'lastYear' | 'older'
}

export function CertificatesPage() {
  const { user, loading: authLoading } = useAuth()
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CertificatesFilters>({
    search: '',
    status: 'all',
    dateRange: 'all'
  })

  useEffect(() => {
    const loadCertificates = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const certificateAPI = await getCertificateAPI()
        const userCertificates = await certificateAPI.getStudentCertificates(user.id)
        setCertificates(userCertificates)
      } catch (err) {
        console.error('Failed to load certificates:', err)
        setError('Failed to load certificates. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadCertificates()
    }
  }, [user, authLoading])

  const filteredCertificates = certificates.filter(cert => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = (
        cert.courseName.toLowerCase().includes(searchTerm) ||
        cert.certificateId.toLowerCase().includes(searchTerm)
      )
      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status !== cert.status) return false
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const certDate = new Date(cert.examinationDate)
      const now = new Date()
      const monthsAgo = new Date()
      
      switch (filters.dateRange) {
        case 'recent':
          monthsAgo.setMonth(now.getMonth() - 3)
          if (certDate < monthsAgo) return false
          break
        case 'lastYear':
          monthsAgo.setFullYear(now.getFullYear() - 1)
          if (certDate < monthsAgo) return false
          break
        case 'older':
          monthsAgo.setFullYear(now.getFullYear() - 1)
          if (certDate >= monthsAgo) return false
          break
      }
    }

    return true
  })

  const activeCertificates = certificates.filter(cert => cert.status === 'active')
  const revokedCertificates = certificates.filter(cert => cert.status === 'revoked')

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading certificates...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Certificates</h1>
            <p className="text-xl text-muted-foreground">
              Secure, verifiable credentials powered by blockchain technology.
            </p>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Please sign in to view your certificates and learn about blockchain verification.
            </AlertDescription>
          </Alert>

          <BlockchainBenefits />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">My Certificates</h1>
            <p className="text-xl text-muted-foreground">
              Your blockchain-verified learning achievements.
            </p>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your certificates...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">My Certificates</h1>
            <p className="text-xl text-muted-foreground">
              Your blockchain-verified learning achievements.
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">My Certificates</h1>
          <p className="text-xl text-muted-foreground">
            Your blockchain-verified learning achievements.
          </p>
          {certificates.length > 0 && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{activeCertificates.length} Active</span>
              </div>
              {revokedCertificates.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{revokedCertificates.length} Revoked</span>
                </div>
              )}
            </div>
          )}
        </div>

        {certificates.length === 0 ? (
          <div className="space-y-8">
            <EmptyCertificatesState />
            <BlockchainBenefits />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  All ({certificates.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Active ({activeCertificates.length})
                </TabsTrigger>
                <TabsTrigger value="revoked" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Revoked ({revokedCertificates.length})
                </TabsTrigger>
              </TabsList>

              <CertificatesFilters 
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            <TabsContent value="all" className="mt-6">
              <CertificatesGrid 
                certificates={filteredCertificates}
                emptyMessage="No certificates match your current filters."
              />
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <CertificatesGrid 
                certificates={activeCertificates.filter(cert => {
                  if (filters.search) {
                    const searchTerm = filters.search.toLowerCase()
                    return (
                      cert.courseName.toLowerCase().includes(searchTerm) ||
                      cert.certificateId.toLowerCase().includes(searchTerm)
                    )
                  }
                  return true
                })}
                emptyMessage="No active certificates found."
              />
            </TabsContent>

            <TabsContent value="revoked" className="mt-6">
              <CertificatesGrid 
                certificates={revokedCertificates}
                emptyMessage="No revoked certificates found."
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Benefits section for users with certificates */}
        {certificates.length > 0 && (
          <div className="mt-12">
            <BlockchainBenefits showTitle={false} />
          </div>
        )}
      </div>
    </div>
  )
}