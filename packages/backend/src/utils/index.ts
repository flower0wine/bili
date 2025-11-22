export function string2Object<T>(str: string) {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return undefined as T;
  }
}

export function any2Object<T>(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (e) {
    return undefined as T;
  }
}
