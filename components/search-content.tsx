import { serializeStructuredData } from '@/lib/search-policy';
import {
  CONTENT_UPDATED,
  CONTENT_UPDATED_LABEL,
  type Answer,
  type Source,
} from '@/lib/search-content';
export function StructuredData({ value }: { value: unknown }) {
  if (!value) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(value) }}
    />
  );
}
export function QuickAnswer({ content }: { content: Answer }) {
  return (
    <section className="quick-answer" aria-label="At a glance">
      <p className="eyebrow">AT A GLANCE</p>
      <h2>{content.question}</h2>
      <p>{content.answer}</p>
    </section>
  );
}
export function ContentSources({ sources }: { sources: Source[] }) {
  return (
    <aside className="content-sources" aria-label="Sources and content information">
      <p>
        <strong>Further reading</strong>
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.name}
            </a>
          </li>
        ))}
      </ul>
      <p className="content-date">
        Updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED_LABEL}</time>. General
        information; individual advice and the applicable jurisdiction may differ.
      </p>
    </aside>
  );
}
