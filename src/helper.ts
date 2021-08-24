export const anyToInt = (val: unknown) => {
  const numVal = parseInt(val + "") || 0;
  return isFinite(numVal) ? numVal : 0;
};
export const anyToNaturalInt = (val: unknown) => {
  const float = anyToInt(val);
  return float < 0 ? 0 : float;
};
export const anyToFloat = (val: unknown) => {
  const numVal = parseFloat(val + "") || 0;
  return isFinite(numVal) ? numVal : 0;
};
export const anyToNaturalFloat = (val: unknown) => {
  const float = anyToFloat(val);
  return float < 0 ? 0 : float;
};
export const anyToBigInt = (val: unknown) => {
  try {
    return BigInt(parseInt(val + "")) || 0n;
  } catch {
    return 0n;
  }
};
export const anyToNaturalBigInt = (val: unknown) => {
  const numVal = anyToBigInt(val);
  return numVal < 0n ? 0n : numVal;
};
export const to6eBn = (num: number) => {
  return BigInt(Math.floor(num * 1e6));
};
