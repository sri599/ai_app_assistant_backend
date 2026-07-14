/**
 * Picks the preferred provider+model for a capability/language from the
 * raw /admin/providers list. Falls back to any active provider of the
 * same `type` if the preferred one (or its model) isn't available.
 */
function resolveProvider({ providers, type, language, preferenceMap }) {
  const active = (providers || []).filter(
    (p) => p.type === type && (p.status === true || p.status === "true")
  );
  if (active.length === 0) return null;

  const pref = preferenceMap[language];
  if (pref) {
    const match = active.find((p) => {
      // `provider_name` is often "" (empty string) rather than null in the
      // API response — fall back to `name` whenever it's blank.
      const rawProviderName = (p.provider_name || "").toString().trim();
      const rawName = (p.name || "").toString().trim();
      const name = (rawProviderName.length ? rawProviderName : rawName).toLowerCase();
      const models = Array.isArray(p.models) ? p.models : [];
      return name === pref.providerName.toLowerCase() && models.includes(pref.model);
    });
    if (match) {
      return {
        providerId: match.id,
        providerName: match.name || match.provider_name,
        model: pref.model,
      };
    }
  }

  // Fallback: prefer the marked default, else the first active one.
  const fallback =
    active.find((p) => p.is_default === true || p.is_default === "true") || active[0];
  const models = Array.isArray(fallback.models) ? fallback.models : [];
  return {
    providerId: fallback.id,
    providerName: fallback.name || fallback.provider_name,
    model: models[0] || "",
  };
}

module.exports = { resolveProvider };