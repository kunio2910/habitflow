async function parseResponse(response) {
  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {};
  }

  if (!response.ok) {
    const error = new Error(result.error || "Không thể đồng bộ dữ liệu");
    error.code = result.code || "SYNC_ERROR";
    error.status = response.status;
    throw error;
  }

  return result;
}

export async function loadCloudState() {
  const response = await fetch("/api/sync", {
    method: "GET",
    cache: "no-store",
    credentials: "include"
  });

  return parseResponse(response);
}

export async function saveCloudState(state) {
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ state }),
    credentials: "include"
  });

  return parseResponse(response);
}
