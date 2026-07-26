import { readSheetValues, updateSheetValues } from "../../../lib/googleSheets.js";

export const dynamic = "force-dynamic";

const STATE_KEYS = [
  "habits",
  "completionHistory",
  "goals",
  "notes",
  "unlockedAchievements",
  "theme"
];

function safeEqual(received, expected) {
  if (!received || !expected || received.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < received.length; index += 1) {
    difference |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}

function isAuthorized(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  return safeEqual(token, process.env.HABITFLOW_SYNC_TOKEN || "");
}

async function readState() {
  const rows = await readSheetValues("State!A2:C");
  const state = {};
  let updatedAt = null;

  for (const [key, json, rowUpdatedAt] of rows) {
    if (!STATE_KEYS.includes(key) || !json) continue;

    try {
      state[key] = JSON.parse(json);
      if (rowUpdatedAt && (!updatedAt || rowUpdatedAt > updatedAt)) {
        updatedAt = rowUpdatedAt;
      }
    } catch {
      console.error(`Bỏ qua dữ liệu JSON không hợp lệ ở khóa ${key}`);
    }
  }

  return { state, updatedAt };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Mã đồng bộ không đúng" }, { status: 401 });
  }

  try {
    const result = await readState();

    return Response.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("Không thể đọc Google Sheets:", error);
    return Response.json(
      { error: "Không thể đọc dữ liệu từ Google Sheets" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Mã đồng bộ không đúng" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const incomingState = payload?.state;

    if (
      !incomingState ||
      typeof incomingState !== "object" ||
      Array.isArray(incomingState)
    ) {
      return Response.json({ error: "Dữ liệu gửi lên không hợp lệ" }, { status: 400 });
    }

    const current = await readState();
    const mergedState = { ...current.state };

    for (const key of STATE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(incomingState, key)) {
        mergedState[key] = incomingState[key];
      }
    }

    const updatedAt = new Date().toISOString();
    const rows = [
      ["key", "json", "updated_at"],
      ...STATE_KEYS.map((key) => [
        key,
        JSON.stringify(mergedState[key] ?? null),
        updatedAt
      ])
    ];

    await updateSheetValues(`State!A1:C${rows.length}`, rows);

    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    console.error("Không thể ghi Google Sheets:", error);
    return Response.json(
      { error: "Không thể lưu dữ liệu vào Google Sheets" },
      { status: 500 }
    );
  }
}
