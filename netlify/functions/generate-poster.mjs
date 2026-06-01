import { getStore } from "@netlify/blobs";
import { jsonResponse, parseJson } from "./poster-api.mjs";

function jobStore() {
  return getStore("poster-jobs");
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const payload = await parseJson(req);
    if (!payload.prompt || typeof payload.prompt !== "string") {
      return jsonResponse(400, { ok: false, error: "缺少 prompt" });
    }

    const jobId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await jobStore().setJSON(jobId, {
      ok: true,
      jobId,
      status: "queued",
      createdAt
    });

    const origin = new URL(req.url).origin;
    const trigger = await fetch(`${origin}/.netlify/functions/generate-poster-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, payload })
    });

    if (!trigger.ok && trigger.status !== 202) {
      const text = await trigger.text();
      await jobStore().setJSON(jobId, {
        ok: false,
        jobId,
        status: "error",
        error: `后台生成任务启动失败：${text || trigger.status}`,
        createdAt,
        updatedAt: new Date().toISOString()
      });
      return jsonResponse(500, {
        ok: false,
        error: "后台生成任务启动失败，请稍后重试。"
      });
    }

    return jsonResponse(202, {
      ok: true,
      async: true,
      jobId,
      status: "queued",
      statusUrl: `/api/poster-status?id=${encodeURIComponent(jobId)}`,
      createdAt
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: error.message || "生成任务创建失败"
    });
  }
};

export const config = {
  path: "/api/generate-poster"
};

