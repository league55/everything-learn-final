import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

interface CertificatesFiltersProps {
  filters: {
    search: string
    status: 'all' | 'active' | 'revoked'
    dateRange: 'all' | 'recent' | 'lastYear' | 'older'
  }
  onFiltersChange: (filters: CertificatesFiltersProps['filters']) => void
}

export function CertificatesFilters({ filters, onFiltersChange }: CertificatesFiltersProps) {
  const updateFilter = (key: keyof typeof filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search certificates..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="recent">Last 3 Months</SelectItem>
            <SelectItem value="lastYear">Last Year</SelectItem>
            <SelectItem value="older">Older</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}