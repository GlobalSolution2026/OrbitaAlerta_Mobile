export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
