import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";
import { loadLegalDoc } from "@/lib/legal-doc";
import { site } from "@/content/site";

// The Open Mic Explorer privacy policy. Apple checks this link during review,
// so it stays reachable with no login, no app install, and no JavaScript. The
// text is generated in the app repo and rendered here as written.

const doc = loadLegalDoc("privacy");

export const metadata: Metadata = {
  title: `${doc.title}. Open Mic Explorer`,
  description:
    "The privacy policy for the Open Mic Explorer mobile app: what it collects, why, and how to delete it.",
  alternates: {
    canonical: "/open-mics/privacy",
  },
};

export default function OpenMicExplorerPrivacyPage() {
  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/open-mics/privacy", doc.title)} />
      <LegalDocument
        title={doc.title}
        intro={
          <>
            This policy covers the{" "}
            <Link
              href="/open-mics"
              className="underline underline-offset-4 hover:text-slime"
            >
              Open Mic Explorer
            </Link>{" "}
            mobile app, published as written by the app. To delete your
            account, use{" "}
            <Link
              href="/open-mics/delete-account"
              className="underline underline-offset-4 hover:text-slime"
            >
              the deletion page
            </Link>
            , or write to{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="underline underline-offset-4 hover:text-slime"
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
