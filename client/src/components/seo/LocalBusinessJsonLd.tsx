import { LOCAL_BUSINESS_SCHEMA } from "@/data/seo";
import JsonLd from "./JsonLd";

export default function LocalBusinessJsonLd() {
  return <JsonLd id="local-business" data={LOCAL_BUSINESS_SCHEMA} />;
}
