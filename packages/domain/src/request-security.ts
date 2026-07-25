type RequestHeaders = {
  get(name: string): string | null;
};

type RequestMetadata = {
  headers: RequestHeaders;
  nextUrl: {
    origin: string;
  };
};

export function hasInvalidRequestOrigin(request: RequestMetadata) {
  const origin = request.headers.get("origin");

  return Boolean(origin && origin !== request.nextUrl.origin);
}

export function hasOversizedRequestBody(
  request: Pick<RequestMetadata, "headers">,
  maximumBytes: number,
) {
  const header = request.headers.get("content-length");

  if (!header) return false;

  const length = Number(header);

  return Number.isFinite(length) && length > maximumBytes;
}

export function getForwardedClientAddress(
  request: Pick<RequestMetadata, "headers">,
) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
