/** Paleta OrbitaAlerta — space-tech + alerta de incêndio */
const primary = '#FF6B35';
const secondary = '#1B4965';
const accent = '#5FA8D3';
const danger = '#E63946';
const success = '#2A9D8F';
const warning = '#F4A261';

const tintColorLight = primary;
const tintColorDark = primary;

export default {
  light: {
    text: '#0B1D3A',
    textSecondary: '#4A5568',
    background: '#F7F9FC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    tint: tintColorLight,
    primary,
    secondary,
    accent,
    danger,
    success,
    warning,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0B1D3A',
    card: '#132F4C',
    border: '#1E3A5F',
    tint: tintColorDark,
    primary,
    secondary: '#2D6A8F',
    accent,
    danger,
    success,
    warning,
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
  },
};

export const priorityColors: Record<string, string> = {
  critical: danger,
  high: '#E76F51',
  medium: warning,
  low: success,
};
