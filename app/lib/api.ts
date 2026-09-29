const SERVER_API_URL =
  process.env.API_SERVER_URL || "http://localhost:5000/api";

const BROWSER_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "/backend-api";

export function getServerApiUrl() {
  return SERVER_API_URL;
}

export function getBrowserApiUrl() {
  return BROWSER_API_URL;
}