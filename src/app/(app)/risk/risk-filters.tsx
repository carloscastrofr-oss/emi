
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { riskCategories, riskStatuses, type RiskCategory, type RiskStatus } from '@/types/risk';

interface RiskFiltersProps {
    filters: {
        category: RiskCategory | 'all';
        status: RiskStatus | 'all';
    };
    onFilterChange: (newFilters: { category: RiskCategory | 'all'; status: RiskStatus | 'all' }) => void;
}

export function RiskFilters({ filters, onFilterChange }: RiskFiltersProps) {

    const handleCategoryChange = (value: string) => {
        onFilterChange({ ...filters, category: value as RiskCategory | 'all' });
    };

    const handleStatusChange = (value: string) => {
        onFilterChange({ ...filters, status: value as RiskStatus | 'all' });
    };

    return (
        <Card className="rounded-expressive">
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="category-filter">Categoría</Label>
                    <Select value={filters.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category-filter">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {(Object.keys(riskCategories) as RiskCategory[]).map(cat => (
                                <SelectItem key={cat} value={cat}>{riskCategories[cat].label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status-filter">Estado</Label>
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                        <SelectTrigger id="status-filter">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {riskStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
