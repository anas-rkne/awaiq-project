/**
 * Serialises a schema.org object into a `<script type="application/ld+json">`.
 * `<` is escaped to `\u003c` so a stray tag in the data can never break out of
 * the script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
