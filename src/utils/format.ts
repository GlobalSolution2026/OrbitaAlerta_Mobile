export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDistance(km?: number): string {
  if (km == null) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function priorityLabel(level: string): string {
  const labels: Record<string, string> = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
  };
  return labels[level] ?? level;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_validation: 'Aguardando validação',
    validated: 'Validado',
    dispatched: 'Despachado',
    in_field: 'Em campo',
    resolved: 'Resolvido',
    false_positive: 'Falso positivo',
  };
  return labels[status] ?? status;
}
