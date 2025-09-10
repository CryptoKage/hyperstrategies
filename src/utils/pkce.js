// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK into your new src/utils/pkce.js FILE
// ==============================================================================

// Helper to Base64 encode a buffer in a URL-safe way
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generates a cryptographically secure code verifier and its corresponding
 * S256 code challenge for the PKCE OAuth 2.0 flow.
 * @returns {Promise<{verifier: string, challenge: string}>}
 */
export async function createPkcePair() {
  // Create a random 32-byte buffer
  const verifierBuffer = crypto.getRandomValues(new Uint8Array(32));
  // URL-safe Base64 encode the buffer to create the verifier
  const verifier = base64UrlEncode(verifierBuffer);

  // Hash the verifier using SHA-256
  const encoder = new TextEncoder();
  const challengeBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
  // URL-safe Base64 encode the hash to create the challenge
  const challenge = base64UrlEncode(challengeBuffer);

  return { verifier, challenge };
}
// ==============================================================================
// END OF FILE
// ==============================================================================
