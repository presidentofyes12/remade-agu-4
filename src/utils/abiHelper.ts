import { type Abi } from 'viem'

/**
 * Ensures ABI is properly formatted as an array
 * Fixes "abi.filter is not a function" errors
 */
export function ensureAbiArray(abiData: any): Abi {
  // Handle undefined/null
  if (!abiData) {
    console.error("ABI data is undefined or null");
    return [];
  }

  // If the ABI is in a contract compilation output
  if (abiData && typeof abiData === 'object' && Array.isArray(abiData.abi)) {
    return abiData.abi as Abi;
  }

  // If ABI is in contract compilation output format
  if (abiData && typeof abiData === 'object' && abiData.abi) {
    return abiData.abi as Abi;
  }

  // If ABI contains nested abi property inside data
  if (abiData && typeof abiData === 'object' && abiData.data && Array.isArray(abiData.data.abi)) {
    return abiData.data.abi as Abi;
  }

  // If ABI is already an array, return it
  if (Array.isArray(abiData)) {
    return abiData as Abi;
  }

  // If it's a JSON string, parse it
  if (typeof abiData === 'string') {
    try {
      const parsed = JSON.parse(abiData);
      return ensureAbiArray(parsed); // Recursively check the parsed result
    } catch (e) {
      console.error("Failed to parse ABI string:", e);
      return [];
    }
  }

  // Return empty array as fallback
  console.error("Invalid ABI format:", abiData);
  return [];
} 