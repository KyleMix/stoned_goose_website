import type { Thing, WithContext } from "schema-dts";

// Wraps a schema-dts Thing in an @context envelope and serializes it for safe
// injection into a <script type="application/ld+json"> tag. Returns a string
// already escaped against `</script>` injection.
export function jsonLdString<T extends Thing>(thing: T): string {
  const wrapped = {
    "@context": "https://schema.org",
    ...(thing as object),
  } as WithContext<T>;
  return JSON.stringify(wrapped).replace(/</g, "\\u003c");
}
