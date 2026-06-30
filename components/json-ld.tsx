import type { Thing, WithContext } from "schema-dts";

// Server component that renders a schema-dts-typed JSON-LD object into a
// <script type="application/ld+json"> tag.
//
// The `schema` prop is a WithContext<T>, so every object passed in already
// carries its own "@context" and is fully typed against schema.org. A malformed
// object (wrong field, wrong @type, bad value) fails `tsc` rather than shipping
// broken markup. That typecheck is our validation mechanism.
//
// The serialized JSON escapes "<" so a value can never break out of the script
// tag (e.g. a stray "</script>" in copy).
export function JsonLd<T extends Thing>({ schema }: { schema: WithContext<T> }) {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
