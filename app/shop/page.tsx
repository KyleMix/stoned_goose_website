import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <Placeholder
      index="06"
      title="Shop"
      brief="Fourthwall product grid (Metal Goose, LOGO Hoodie, Sick Hat, and the rest). Externals open in Fourthwall."
    />
  );
}
