export function getLocalItem(name: string) {
  const res = localStorage.getItem(name);
  if(!res) return res;
  try {
    return JSON.parse(res);
  }catch {
    return res;
  }
}