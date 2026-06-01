import { getStore } from "@netlify/blobs";
import { generatePosterImage, parseJson } from "./poster-api.mjs";

function jobStore() {
  return getStore("poster-jobs");
}

export default async (req) => {
  let jobId = "";
  try {
    const body = await parseJson(req);
    jobId = body.jobId;
    const payload = body.payload;
    if (!jobId || !payload) return;

    await jobStore().setJSON(jobId, {
      ok: true,
      jobId,
      status: "running",
      updatedAt: new Date().toISOString()
    });

    const result = await generatePosterImage(payload);
    await jobStore().setJSON(jobId, {
      ok: true,
      jobId,
      status: "done",
      provider: result.provider,
      model: result.model,
      imageBase64: result.imageBase64,
      imageUrl: result.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (jobId) {
      await jobStore().setJSON(jobId, {
        ok: false,
        jobId,
        status: "error",
        error: error.message || "生成失败",
        updatedAt: new Date().toISOString()
      });
    }
  }
};

