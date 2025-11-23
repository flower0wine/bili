export function toError(unknownError: unknown): Error {
  if (unknownError instanceof Error) {
    // 如果它本身就是一个 Error，直接返回
    return unknownError;
  }

  // 如果它是一个字符串，用它来创建一个新的 Error
  if (typeof unknownError === "string") {
    return new Error(unknownError);
  }

  // 对于其他类型（如对象、数字等），尝试将其序列化为 JSON 字符串
  // 作为错误信息，以便于记录。
  try {
    return new Error(JSON.stringify(unknownError));
  } catch {
    // 如果连 JSON.stringify 都失败了（比如循环引用），就给一个通用的错误信息
    return new Error(String(unknownError));
  }
}
