const kOriginalError = Symbol("original_error");

export function toError(err: unknown, seen = new WeakSet()): Error {
  // 防止循环引用
  if (err && typeof err === "object") {
    if (seen.has(err)) {
      return new Error("Circular error structure");
    }
    seen.add(err);
  }

  // null / undefined
  if (err == null) {
    return new Error("Thrown null/undefined");
  }

  // string
  if (typeof err === "string") {
    return new Error(err);
  }

  // true native Error（跨 realm 兼容）
  if (err instanceof Error) {
    return err;
  }

  // brand check: Error / DOMException
  const tag = Object.prototype.toString.call(err);
  if (tag === "[object Error]" || tag === "[object DOMException]") {
    return err as Error;
  }

  // object: Error-like 进行提取
  if (typeof err === "object") {
    const e = err as Record<string, any>;

    const message =
      (typeof e.message === "string" && e.message) ||
      (typeof e.error === "string" && e.error) ||
      (typeof e.msg === "string" && e.msg) ||
      (typeof e.reason === "string" && e.reason) ||
      (typeof e.description === "string" && e.description) ||
      (typeof e.title === "string" && e.title) ||
      "Unknown error";

    const out = new Error(message);

    // name
    if (typeof e.name === "string") {
      out.name = e.name;
    } else if (typeof e.code === "string") {
      out.name = e.code;
    }

    // cause（递归）
    if ("cause" in e) {
      out.cause = toError(e.cause, seen);
    }

    // 原始对象，以 symbol 避免污染
    (out as any)[kOriginalError] = err;

    return out;
  }

  // primitive
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const out = new Error(String(err));
  (out as any)[kOriginalError] = err;
  return out;
}
