/**
 * API client for verification related requests
 * This handles email verification and resending the verification code
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Verifies user email with a code
 * @param email - The email of the user
 * @param code - The 6-digit verification code
 * @returns The response from the server
 */
export const verifyEmail = async (email: string, code: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, code: parseInt(code) }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    return data;
  } catch (error) {
    console.error("Verify API error:", error);
    throw error;
  }
};

/**
 * Resends the verification code to the user's email
 * @param email - The email of the user
 * @returns The response from the server
 */
export const resendVerificationCode = async (email: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/verify/resend-verification-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend verification code");
    }

    return data;
  } catch (error) {
    console.error("Resend Verification API error:", error);
    throw error;
  }
};
