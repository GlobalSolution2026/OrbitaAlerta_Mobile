export const primary = '#FF6B35';
export const primaryDark = '#CC4A1A';
export const primaryLight = '#FF9458';
export const secondary = '#0F2B45';
export const accent = '#4ECDC4';
export const danger = '#FF3B30';
export const dangerLight = '#FF6B6B';
export const success = '#34C759';
export const successLight = '#4CD964';
export const warning = '#FF9500';
export const warningLight = '#FFCC00';

const tintColorLight = primary;
const tintColorDark = primary;

export default {
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#F2F3F7',
    backgroundAlt: '#E8EAF0',
    card: '#FFFFFF',
    cardAlt: '#FAFBFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    tint: tintColorLight,
    primary,
    primaryDark,
    primaryLight,
    secondary,
    accent,
    danger,
    dangerLight,
    success,
    successLight,
    warning,
    warningLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0B132B',
    backgroundAlt: '#101D3A',
    card: '#1A2A4A',
    cardAlt: '#1E3260',
    border: '#2A3F6A',
    borderLight: '#1E3055',
    tint: tintColorDark,
    primary,
    primaryDark,
    primaryLight,
    secondary: '#1E3A5F',
    accent,
    danger,
    dangerLight,
    success,
    successLight,
    warning,
    warningLight,
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export const priorityColors: Record<string, string> = {
  critical: danger,
  high: warning,
  medium: accent,
  low: successLight,
};

export const priorityBgColors: Record<string, string> = {
  critical: '#FFF0F0',
  high: '#FFF8E7',
  medium: '#E8FAF8',
  low: '#EBF9EB',
};

export const priorityBgColorsDark: Record<string, string> = {
  critical: 'rgba(255,59,48,0.15)',
  high: 'rgba(255,149,0,0.15)',
  medium: 'rgba(78,205,196,0.15)',
  low: 'rgba(52,199,89,0.15)',
};
