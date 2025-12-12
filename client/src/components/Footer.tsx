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
    href: "mailto:contact@stonedgooseproductions.com",
    Icon: FaEnvelope,
  },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center gap-6 mb-8">
          {socialLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={label}
              className="text-gray-400 hover:text-primary transition-colors transform hover:scale-110"
            >
              <Icon className="w-6 h-6" />
            </a>
          ))}
        </div>
        
        <p className="text-gray-500 text-sm mb-2">
          &copy; {new Date().getFullYear()} Stoned Goose Productions. All rights reserved. 
        </p>
        <p className="text-gray-600 text-xs font-mono">
          Website Design by Kyle Mixon.
        </p>
      </div>
    </footer>
  );
}
