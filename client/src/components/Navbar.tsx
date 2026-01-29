import { useState, useEffect, type MouseEvent } from "react";
import { Menu, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@assets/logo.png";

// social icons from react-icons
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaPatreon,
  FaEnvelope,
} from "react-icons/fa6";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "Upcoming Shows", href: "#shows" },
  { name: "Services", href: "/services" },
  { name: "About", href: "#about" },
  { name: "Comedians", href: "#comedians" },
  { name: "Merch", href: "#merch" },
  { name: "Media", href: "#media" },
  { name: "Contact", href: "#contact" },
];

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

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    closeOnNavigate = false
  ) => {
    if (href.startsWith("#")) {
      event.preventDefault();
      scrollToSection(href);
      return;
    }

    if (closeOnNavigate) {
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-primary/20 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* LEFT: Logo + Socials */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#home");
            }}
            className="flex items-center gap-2 group"
          >
            <img
              src={logo}
              alt="Stoned Goose Logo"
              className="h-16 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </a>

          {/* Social icons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={label}
                className="p-2 rounded-full border border-border/60 hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT: Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                handleNavClick(e, item.href);
              }}
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors uppercase tracking-wide"
            >
              {item.name}
            </a>
          ))}
          <Button
            variant="default"
            className="bg-primary text-black hover:bg-primary/90 hover:scale-105 transition-all font-bold uppercase"
            onClick={() => scrollToSection("#services")}
          >
            Book Services
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-black/95 border-l-primary/20 w-[300px]"
            >
              <div className="flex flex-col gap-8 mt-10">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item.href, true);
                    }}
                    className="text-2xl font-display uppercase text-white hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                ))}

                {/* Social icons in mobile menu */}
                <div className="pt-4 border-t border-border/40 flex flex-wrap gap-3">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer" : undefined}
                      aria-label={label}
                      className="p-2 rounded-full border border-border/60 hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
