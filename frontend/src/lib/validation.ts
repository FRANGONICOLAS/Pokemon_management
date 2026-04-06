export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isStrongPassword(value: string): boolean {
  const length = value.length >= 8 && value.length <= 64;
  const upper = /[A-Z]/.test(value);
  const lower = /[a-z]/.test(value);
  const number = /\d/.test(value);
  const special = /[^A-Za-z0-9]/.test(value);
  const noSpaces = /^\S+$/.test(value);

  return length && upper && lower && number && special && noSpaces;
}
