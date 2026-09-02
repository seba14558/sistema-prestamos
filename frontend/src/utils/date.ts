export const formatDateDisplay = (value?: string | Date | null) => {
  if (!value) return '';

  let normalized = '';

  if (typeof value === 'string') {
    normalized = value.includes('T') ? value.split('T')[0] : value;
  } else {
    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    normalized = localDate.toISOString().slice(0, 10);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return normalized;
    }

    const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    normalized = localDate.toISOString().slice(0, 10);
  }

  const [year, month, day] = normalized.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  }).format(new Date(year, month - 1, day));
};

export const normalizeDateString = (value?: string | Date | null) => {
  if (!value) return '';

  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value;
  }

  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};