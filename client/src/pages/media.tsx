import Navbar from "@/components/Navbar";
import Media from "@/components/Media";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Media | Stoned Goose Productions"
        description="Watch highlights, comedy specials, and behind-the-scenes content from Stoned Goose Productions."
        path="/media"
      />
      <Navbar />
      <main className="pt-[var(--header-height)]">
        <Media />
      </main>
      <Footer />
    </div>
  );
}
