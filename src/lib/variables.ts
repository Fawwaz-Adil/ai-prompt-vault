// {{variable}} templating. Missing values keep their placeholder visible so
// the user can spot them instead of silently sending broken text.
const VAR_RE = /\{\{\s*([^{}\n]+?)\s*\}\}/g;

export function extractVariables(body: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const match of body.matchAll(VAR_RE)) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

export function fillVariables(
  body: string,
  values: Record<string, string>,
): { text: string; missing: string[] } {
  const missing: string[] = [];
  const text = body.replace(VAR_RE, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined || value === '') {
      if (!missing.includes(name)) missing.push(name);
      return placeholder;
    }
    return value;
  });
  return { text, missing };
}
