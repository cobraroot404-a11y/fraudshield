async function request(method, url, payload, { headers, responseType } = {}) {
  const requestHeaders = new Headers(headers);
  if (payload !== undefined) requestHeaders.set("Content-Type", "application/json");
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = response.ok && responseType === "blob"
    ? await response.blob()
    : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.response = { status: response.status, data };
    throw error;
  }
  return { data };
}

export const api = {
  get: (url, options) => request("GET", url, undefined, options),
  delete: (url, options) => request("DELETE", url, undefined, options),
  post: (url, payload, options) => request("POST", url, payload, options),
  patch: (url, payload, options) => request("PATCH", url, payload, options),
};
