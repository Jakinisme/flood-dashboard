export const getRiskColor = (risk: string): string => {
    switch (risk.toUpperCase()) {
        case 'LOW': return '#82ca9d';
        case 'MEDIUM': return '#ffc658';
        case 'HIGH': return '#ff8042';
        case 'CRITICAL': return '#ff4842';
        default: return '#a0a0a0';
    }
};