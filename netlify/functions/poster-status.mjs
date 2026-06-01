import { getStore } from "@netlify/blobs";
import { jsonResponse } from "./poster-api.mjs";

function jobStore() {
  return getStore("poster-jobs");
}

export default async (req) => {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("id");
  if (!jobId) {
    return jsonResponse(400, { ok: false, error: "缺少任务 id" });
  }

  const job = await jobStore().get(jobId, { type: "json" });
  if (!job) {
    return jsonResponse(404, { ok: false, status: "missing", error: "任务不存在或已过期" });
  }

  return jsonResponse(200, job);
};

export const config = {
  path: "/api/poster-status"
};

