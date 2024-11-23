
export const getAssets = url => {
  return new URL(`../assets/${url}`, import.meta.url).href
}