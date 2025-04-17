import { BASE_URL } from "../config/apiConfig";

// Encrypt multiple texts (returns 5-char short codes)
export const encryptBatch = async (textsArray) => {
  try {
    if (!Array.isArray(textsArray) || textsArray.length === 0) {
      throw new Error("encryptBatch expects a non-empty array of texts");
    }

    const response = await fetch(`${BASE_URL}/EncryptDecrypt/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: textsArray.map(item => item.toString()) }),
    });

    if (!response.ok) {
      throw new Error("Encryption API call failed");
    }

    const data = await response.json();
    return data.shortCodes; // now using shortCodes instead of encryptedArray
  } catch (error) {
    console.error("Batch encryption error:", error);
    throw error;
  }
};

// Decrypt short codes (5-char tokens)
export const decryptBatch = async (shortCodesArray) => {
  try {
    if (!Array.isArray(shortCodesArray) || shortCodesArray.length === 0) {
      throw new Error("decryptBatch expects a non-empty array of short codes");
    }

    const response = await fetch(`${BASE_URL}/EncryptDecrypt/decrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortCodes: shortCodesArray }),
    });

    if (!response.ok) {
      throw new Error("Decryption API call failed");
    }

    const data = await response.json();
    return data.decryptedArray;
  } catch (error) {
    console.error("Batch decryption error:", error);
    throw error;
  }
};
