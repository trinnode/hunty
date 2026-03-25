import Server from "@stellar/stellar-sdk"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SorobanServer = Server as any;

/**
 * Default RPC URL for Soroban (Futurenet).
 * Override with NEXT_PUBLIC_SOROBAN_RPC_URL in .env.local.
 */
export const DEFAULT_RPC_URL = "https://rpc.futurenet.stellar.org"

/**
 * Default network passphrase for Futurenet.
 * Override with NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE in .env.local.
 */
export const DEFAULT_NETWORK_PASSPHRASE =
  "Test SDF Future Network ; October 2022"

function getRpcUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? DEFAULT_RPC_URL
  }
  return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? DEFAULT_RPC_URL
}

function getNetworkPassphrase(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE ??
      DEFAULT_NETWORK_PASSPHRASE
    )
  }
  return (
    process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE ??
    DEFAULT_NETWORK_PASSPHRASE
  )
}

/**
 * Creates a Soroban Server instance for the configured RPC URL.
 * Uses the same Server API as soroban-client (stellar-sdk is the maintained package).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSorobanServer(): any {
  return new SorobanServer(getRpcUrl())
}

/**
 * Returns the configured network passphrase (Futurenet/Testnet).
 */
export function getSorobanNetworkPassphrase(): string {
  return getNetworkPassphrase()
}

/**
 * Returns the configured RPC URL.
 */
export function getSorobanRpcUrl(): string {
  return getRpcUrl()
}
