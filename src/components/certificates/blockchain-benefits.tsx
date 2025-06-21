import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Zap, Globe, Lock, CheckCircle, Award, ExternalLink } from 'lucide-react'

interface BlockchainBenefitsProps {
  showTitle?: boolean
}

export function BlockchainBenefits({ showTitle = true }: BlockchainBenefitsProps) {
  const benefits = [
    {
      icon: Shield,
      title: "Tamper-Proof Security",
      description: "Your certificates are stored on the Algorand blockchain, making them impossible to forge or alter.",
      color: "text-blue-500"
    },
    {
      icon: Globe,
      title: "Global Verification",
      description: "Anyone, anywhere can verify your credentials instantly without contacting the issuing institution.",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Blockchain verification happens in seconds, not days or weeks like traditional methods.",
      color: "text-yellow-500"
    },
    {
      icon: Lock,
      title: "You Own Your Data",
      description: "Your certificates belong to you forever. No institution can revoke access to your achievements.",
      color: "text-purple-500"
    },
    {
      icon: CheckCircle,
      title: "Lifetime Validity",
      description: "As long as the blockchain exists, your certificates remain verifiable and valid.",
      color: "text-emerald-500"
    },
    {
      icon: Award,
      title: "Professional Recognition",
      description: "Blockchain certificates are increasingly recognized by employers and institutions worldwide.",
      color: "text-orange-500"
    }
  ]

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Blockchain Certificates Matter</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your achievements deserve the ultimate protection and verification that only blockchain technology can provide.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Algorand specific section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Powered by Algorand</CardTitle>
              <Badge variant="outline" className="mt-1">
                Next-Generation Blockchain
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We chose Algorand for its exceptional benefits that make certificate verification superior to traditional methods:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Carbon Negative</h4>
                  <p className="text-sm text-muted-foreground">
                    Algorand is the world's first carbon-negative blockchain, making your certificates environmentally friendly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Near-Instant Finality</h4>
                  <p className="text-sm text-muted-foreground">
                    Transactions are confirmed in under 3 seconds, enabling real-time certificate verification.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Minimal Fees</h4>
                  <p className="text-sm text-muted-foreground">
                    Transaction costs are fractions of a penny, making verification accessible to everyone.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Future-Proof</h4>
                  <p className="text-sm text-muted-foreground">
                    Built for quantum resistance and designed to last for decades.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <a 
              href="https://www.algorand.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Learn more about Algorand
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}