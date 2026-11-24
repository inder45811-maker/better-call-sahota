const campaignKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_id',
] as const;
export type Campaign = Partial<Record<(typeof campaignKeys)[number], string>>;

export function campaign(value: unknown): Campaign {
  if (!value || typeof value !== 'object') return {};
  const fields = value as Record<string, unknown>;
  return Object.fromEntries(
    campaignKeys.flatMap((key) => {
      const entry = fields[key];
      return typeof entry === 'string' &&
        /^[a-z\d][a-z\d ._+/-]{0,99}$/i.test(entry)
        ? [[key, entry]]
        : [];
    }),
  );
}

export function captureCampaign() {
  const current = campaign(
    Object.fromEntries(new URLSearchParams(window.location.search)),
  );
  try {
    const first = campaign(
      JSON.parse(sessionStorage.getItem('bcs-first-campaign') ?? '{}'),
    );
    const latest = campaign(
      JSON.parse(sessionStorage.getItem('bcs-latest-campaign') ?? '{}'),
    );
    if (!Object.keys(current).length) return { first, latest };
    const firstTouch = Object.keys(first).length ? first : current;
    sessionStorage.setItem('bcs-first-campaign', JSON.stringify(firstTouch));
    sessionStorage.setItem('bcs-latest-campaign', JSON.stringify(current));
    return { first: firstTouch, latest: current };
  } catch {
    return { first: current, latest: current };
  }
}
