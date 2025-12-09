export const calculateLength = (count: number) => {
  const maxLength = 120;
  // Keep dice comfortably visible even with many hidden characters.
  const calculatedLength = Math.max(maxLength - (count - 1) * 3, 40);
  return calculatedLength;
};

export const generateRandomHex = () => {
  const hexDigits = "0123456789ABCDEF";
  const randomIndex = Math.floor(Math.random() * hexDigits.length);
  return hexDigits[randomIndex];
};

export const compareResult = (rolledResult: string[], pkChars: Record<string, string>) => {
  return rolledResult.every((value, index) => value.toLowerCase() === Object.values(pkChars)[index].toLowerCase());
};
