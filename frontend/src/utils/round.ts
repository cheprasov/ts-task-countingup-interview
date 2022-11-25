export const round = (value: number, p: number = 2) => {
  const k = Math.pow(10, p);
  return Math.round(value * k) / k;
}
