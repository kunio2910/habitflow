export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwLvtD7TvbY-Mcko6_gqsROQbdSg46K4PHrvbxS-ijGBg2x8QeWuoNlv52vwHCISP4U/exec";

const DEFAULT_USER_ID = "default";

async function readJsonResponse(response) {
  if (!response.ok) {
    throw new Error(`Google Apps Script trả về lỗi HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Google Apps Script xử lý thất bại");
  }

  return result;
}

export async function saveDataToGoogle(data, userId = DEFAULT_USER_ID) {
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ userId, data })
  });

  return readJsonResponse(response);
}

export async function loadDataFromGoogle(userId = DEFAULT_USER_ID) {
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set("userId", userId);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store"
  });
  const result = await readJsonResponse(response);

  return result.data;
}
