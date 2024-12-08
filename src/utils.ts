export function hasKey(obj: object, key: string) {
  const keys = Object.keys(obj)
  return keys && keys.includes(key)
}
