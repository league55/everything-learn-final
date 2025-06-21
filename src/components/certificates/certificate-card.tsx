import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award, Calendar, Hash, ExternalLink, ShieldCheck, ShieldX } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CertificateData } from '@/blockchain/types/certificate-types'

interface CertificateCardProps {
  certificate: CertificateData
  onClick: () => void
}

export function CertificateCard({ certificate, onClick }: CertificateCardProps) {
  const scorePercentage = Math.round((certificate.score / certificate.maxScore) * 100)
  const achievementLevel = certificate.metadata?.achievementLevel || 'bronze'
  const isActive = certificate.status === 'active'

  const achievementColors = {
    bronze: 'from-amber-500 to-orange-500',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-indigo-600'
  }

  const achievementBadgeColors = {
    bronze: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    silver: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    platinum: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group relative",
        !isActive && "opacity-75"
      )} onClick={onClick}>
        {/* Status indicator */}
        <div className={cn(
          "absolute top-3 right-3 z-10",
          isActive ? "text-green-500" : "text-red-500"
        )}>
          {isActive ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <ShieldX className="h-5 w-5" />
          )}
        </div>

        {/* Achievement level gradient */}
        <div className={cn(
          "h-2 bg-gradient-to-r",
          achievementColors[achievementLevel]
        )} />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2 mb-2 pr-8">
                {certificate.courseName}
              </CardTitle>
              <Badge className={cn("text-xs", achievementBadgeColors[achievementLevel])}>
                {achievementLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {scorePercentage}%
            </span>
          </div>

          {/* Certificate details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(certificate.examinationDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span className="font-mono text-xs truncate">
                {certificate.certificateId.slice(0, 16)}...
              </span>
            </div>

            {certificate.blockchainTxId && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span className="text-xs">Blockchain Verified</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Award className="h-4 w-4 mr-2" />
            View Certificate
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}