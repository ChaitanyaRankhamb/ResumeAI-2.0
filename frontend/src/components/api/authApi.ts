import { fetchapi } from "@/lib/refresh-user";

/**
 * API client for authentication related requests
 * This handles registration, login, and Google OAuth
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiUrl = (path: string) => {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const readJsonResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    return text ? JSON.parse(text) : {};
  }

  const preview = text.replace(/\s+/g, " ").slice(0, 160);
  throw new Error(
    `API returned ${response.status} ${response.statusText || ""} as ${contentType || "unknown content type"}. ` +
      `Check NEXT_PUBLIC_API_URL and backend route. Response preview: ${preview}`,
  );
};

/**
 * Handles user registration
 * @param username - The username of the user
 * @param email - The email of the user
 * @returns The response from the server
 */
export const registerUser = async (username: string, email: string) => {
  try {
    console.log("api url", API_BASE_URL);
    const response = await fetch(apiUrl("/auth/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email }),
      credentials: "include",
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    console.log("user data", data);

    return data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

/**
 * Handles user login
 * @param email - The email of the user
 * @returns The response from the server
 */
export const loginUser = async (email: string) => {
  try {
    const response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

/**
 * Redirects user to Google OAuth flow
 */
export const loginWithGoogle = () => {
  window.location.href = apiUrl("/auth/google");
};

/**
 * Fetches current user details
 * @param token - The access token
 * @returns The user data
 */
export const getMe = async () => {
  try {
    const response = await fetchapi(apiUrl("/auth/me"), {
      method: "GET",
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user data");
    }

    console.log("Returned user data", data);

    return data;
  } catch (error) {
    console.error("GetMe API error:", error);
    throw error;
  }
};

// logout API
export const logoutApi = async () => {
  try {
    const res = await fetch(apiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });

    const data = await readJsonResponse(res);

    if (!res.ok) {
      throw new Error(data.message || "Logout failed");
    }

    return data;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
};

/**
 * Uploads resume file for analysis
 * @param file - The resume file to upload
 * @returns The response from the server
 */
export const uploadResume = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetchapi(
      apiUrl("/upload-resume"),
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    // console the data
    console.log("Upload API response data:", data);

    return data;
  } catch (error) {
    console.error("Upload resume API error:", error);
    throw error;
  }
};
