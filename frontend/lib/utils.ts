import { ethers } from "ethers";

export function shortAddress(address?: string | null) {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function bytes32ToText(value: string) {
  try {
    return ethers.decodeBytes32String(value);
  } catch {
    return value;
  }
}
