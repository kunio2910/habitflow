async function parseResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Không thể đồng bộ dữ liệu");
  }

  return result;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function loadCloudState(token) {
  const response = await fetch("/api/sync", {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store"
  });

  return parseResponse(response);
}

export async function saveCloudState(token, state) {
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ state })
  });

  return parseResponse(response);
}
