export interface TrendingTag {
  tag: string;
  count: number;
}

/**
 * Extracts all unique hashtags from a text string.
 * Preserves initial casing of each tag found.
 */
export function extractHashtags(text?: string): string[] {
  if (!text) return [];
  const regex = /#([a-zA-Z0-9_\u00C0-\u017F]+)/g;
  const matches = text.match(regex);
  if (!matches) return [];

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const m of matches) {
    const lower = m.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      tags.push(m);
    }
  }

  return tags;
}

/**
 * Aggregates hashtags from a list of tweets and returns the top trending tags with counts.
 */
export function getTrendingHashtags(
  tweets: Array<{ content?: string }>,
  limit = 6
): TrendingTag[] {
  if (!tweets || tweets.length === 0) return [];

  const counts: Record<string, { tag: string; count: number }> = {};

  for (const t of tweets) {
    const tags = extractHashtags(t.content);
    for (const tag of tags) {
      const lower = tag.toLowerCase();
      if (!counts[lower]) {
        counts[lower] = { tag, count: 0 };
      }
      counts[lower].count += 1;
    }
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
