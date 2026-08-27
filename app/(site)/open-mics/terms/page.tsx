import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";
import { loadLegalDoc } from "@/lib/legal-doc";
import { site } from "@/content/site";

// The Open Mic Explorer end user license agreement. This is extracted in the
// app repo from whichever EULA version the app's migrations publish, so the
// text here matches the row the app makes people accept. It is rendered as
// written, with no edits on this side.

const doc = loadLegalDoc("terms");

export const metadata: Metadata = {
  title: "Terms. Open Mic Explorer",
  description:
    "The end user license agreement for the Open Mic Explorer mobile app, published as accepted in the app.",
  alternates: {
    canonical: "/open-mics/terms",
  },
};

export default function OpenMicExplorerTermsPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/open-mics/terms", "Terms")} />
      <LegalDocument
        title={doc.title}
        intro={
          <>
            This is the agreement the{" "}
            <Link
              href="/open-mics"
              className="underline underline-offset-4 hover:text-accent-gold"
            >
              Open Mic Explorer
            </Link>{" "}
            app asks you to accept, published as it stands in the app. The{" "}
            <Link
              href="/open-mics/privacy"
              className="underline underline-offset-4 hover:text-accent-gold"
            >
              privacy policy
            </Link>{" "}
            covers what the app collects. Questions go to{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="underline underline-offset-4 hover:text-accent-gold"
            >
              {site.contact.email}
            </a>
            .
          </>
        }
        body={doc.body}
      />
    </>
  );
}
