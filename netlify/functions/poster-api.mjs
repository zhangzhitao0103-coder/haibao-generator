const MIN_DOUBAO_PIXELS = 3686400;

export function env(name) {
  return Netlify.env.get(name);
}

export function jsonResponse(status, data) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function parseJson(req) {
  try {
    return await req.json();
  } catch {
    throw new Error("Failed to parse JSON request body.");
  }
}

function normalizeImageResult(provider, responseJson) {
  const first = responseJson && Array.isArray(responseJson.data) ? responseJson.data[0] : null;
  if (!first) {
    throw new Error(`${provider} did not return image data.`);
  }
  if (first.b64_json) return { imageBase64: first.b64_json };
  if (first.url) return { imageUrl: first.url };
  if (first.image_url) return { imageUrl: first.image_url };
  throw new Error(`${provider} response does not include b64_json, url, or image_url.`);
}

function mergePrompt(prompt, negativePrompt) {
  const guard = negativePrompt ? `\n\nNegative constraints: ${negativePrompt}` : "";
  return `${prompt}${guard}`;
}

function normalizeDoubaoSize(size) {
  if (!size || size === "auto") return "1920x1920";
  const match = String(size).match(/^(\d+)x(\d+)$/);
  if (!match) return "1920x1920";
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width * height >= MIN_DOUBAO_PIXELS) return `${width}x${height}`;
  if (width > height) return "2560x1440";
  if (height > width) return "1440x2560";
  return "1920x1920";
}

async function readUpstreamJson(response, provider) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    const preview = text.slice(0, 300).replace(/\s+/g, " ");
    throw new Error(`${provider} returned non-JSON content: ${preview}`);
  }
}

async function callOpenAI(payload) {
  const apiKey = payload.apiKey || env("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OpenAI API Key. Fill it in the page API settings or set OPENAI_API_KEY in Netlify environment variables.");
  }

  const body = {
    model: payload.model && payload.model !== "__env__" ? payload.model : "gpt-image-2",
    prompt: mergePrompt(payload.prompt, payload.negativePrompt),
    size: payload.size || "1024x1536",
    quality: payload.quality || "high",
    output_format: payload.outputFormat || "png"
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await readUpstreamJson(response, "OpenAI");
  if (!response.ok) {
    const message = json.error && json.error.message ? json.error.message : JSON.stringify(json);
    throw new Error(`OpenAI generation failed: ${message}`);
  }

  return {
    provider: "openai",
    model: body.model,
    ...normalizeImageResult("OpenAI", json)
  };
}

async function callDoubao(payload) {
  const apiKey = payload.apiKey || env("DOUBAO_API_KEY") || env("ARK_API_KEY") || env("VOLCENGINE_API_KEY");
  if (!apiKey) {
    throw new Error("Missing Doubao/Volcengine API Key. Fill it in the page API settings or set DOUBAO_API_KEY/ARK_API_KEY in Netlify environment variables.");
  }

  const endpoint = payload.endpoint || env("DOUBAO_IMAGE_ENDPOINT") || "https://ark.cn-beijing.volces.com/api/v3/images/generations";
  if (endpoint.includes("/chat/completions")) {
    throw new Error("The Doubao endpoint points to /chat/completions, which is not an image generation endpoint. Use /api/v3/images/generations.");
  }

  const model = payload.model && payload.model !== "__env__"
    ? payload.model
    : (env("DOUBAO_IMAGE_MODEL") || "doubao-seedream-4-0-250828");

  const body = {
    model,
    prompt: mergePrompt(payload.prompt, payload.negativePrompt),
    response_format: "url",
    size: normalizeDoubaoSize(payload.size)
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await readUpstreamJson(response, "Doubao");
  if (!response.ok) {
    const message = json.error && json.error.message ? json.error.message : JSON.stringify(json);
    throw new Error(`Doubao generation failed: ${message}`);
  }

  return {
    provider: "doubao",
    model: body.model,
    ...normalizeImageResult("Doubao", json)
  };
}

export async function generatePosterImage(payload) {
  const provider = payload.provider || "openai";
  return provider === "doubao" ? callDoubao(payload) : callOpenAI(payload);
}
