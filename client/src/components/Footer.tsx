import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaPatreon,
  FaEnvelope,
} from "react-icons/fa6";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/stonedgooseproductions/",
    Icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61573095812128",
    Icon: FaFacebook,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@stonedgooseproductions?_t=zt-8xjcguh7awp&_r=1",
    Icon: FaTiktok,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@stonedgooseproductions",
    Icon: FaYoutube,
  },
  {
    label: "Patreon",
    href: "https://www.patreon.com/cw/StonedGooseProductions",
    Icon: FaPatreon,
  },
  {
    label: "Email",
    href: "mailto:kyle@stonedgooseproductions.com",
    Icon: FaEnvelope,
  },
];

type FooterLink = {
  label: string;
  href: string;
  cta?: boolean;
};

type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Upcoming Shows", href: "/#shows" },
      { label: "Comic Submissions", href: "/comic-submissions" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Services", href: "/services" },
      { label: "Sponsorships", href: "/sponsorships" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Book a Show", href: "/#contact", cta: true },
      { label: "Contact", href: "/#contact", cta: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-16">
      <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
        <div className="mb-10 flex flex-wrap justify-center gap-3 sm:gap-4">
          {socialLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={label}
              className="rounded-full border border-white/20 p-2 text-gray-300 transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {footerLinkGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                {group.title}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {group.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`rounded-full border px-4 py-2 text-sm uppercase tracking-[0.12em] transition-colors ${
                      link.cta
                        ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                        : "border-border/60 text-gray-300 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mb-2 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Stoned Goose Productions. All rights reserved.
        </p>
        <p className="text-xs font-mono text-gray-600">Website Design by Kyle Mixon.</p>
      </div>
    </footer>
  );
}
