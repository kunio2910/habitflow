import { readSheetValues, updateSheetValues } from "../../../lib/googleSheets.js";
import { getChatGPTUser } from "../../chatgpt-auth.js";

export const dynamic = "force-dynamic";

const STATE_KEYS = [
  "habits",
  "completionHistory",
  "goals",
  "notes",
  "unlockedAchievements",
  "theme"
];

function allowedEmails() {
  return new Set(
    (process.env.HABITFLOW_ALLOWED_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function authorizeUser() {
  const user = await getChatGPTUser();

  if (!user) {
    return {
      response: Response.json(
        { error: "Vui lòng đăng nhập để đồng bộ", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    };
  }

  const allowed = allowedEmails();
  if (allowed.size === 0) {
    return {
      response: Response.json(
        { error: "Đồng bộ chưa được cấu hình", code: "AUTH_NOT_CONFIGURED" },
        { status: 503 }
      )
    };
  }

  if (!allowed.has(user.email.trim().toLowerCase())) {
    return {
      response: Response.json(
        { error: "Tài khoản này chưa được cấp quyền đồng bộ", code: "AUTH_FORBIDDEN" },
        { status: 403 }
      )
    };
  }

  return { user };
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

export async function GET() {
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

  try {
    const result = await readState();

    return Response.json({
      ...result,
      user: {
        email: authorization.user.email,
        displayName: authorization.user.displayName
      }
    }, {
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
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

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

    return Response.json({
      ok: true,
      updatedAt,
      user: {
        email: authorization.user.email,
        displayName: authorization.user.displayName
      }
    });
  } catch (error) {
    console.error("Không thể ghi Google Sheets:", error);
    return Response.json(
      { error: "Không thể lưu dữ liệu vào Google Sheets" },
      { status: 500 }
    );
  }
}
