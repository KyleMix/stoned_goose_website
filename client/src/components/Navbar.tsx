import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@assets/logo.png";

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
  { name: "Sponsorships", href: "/sponsorships" },
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
    href: "mailto:kyle@stonedgooseproductions.com",
    Icon: FaEnvelope,
  },
];

export default function Navbar() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [location, setLocation] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    const setHeaderHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
    };

    let resizeTimeout: number | undefined;
    const handleResize = () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        setHeaderHeight();
      }, 120);
    };

    setHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
      setHeaderHeight();
    });

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }

      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const setSectionFromHash = () => {
      const currentHash = window.location.hash;
      setActiveSection(currentHash || "#home");
    };

    setSectionFromHash();
    window.addEventListener("hashchange", setSectionFromHash);

    return () => {
      window.removeEventListener("hashchange", setSectionFromHash);
    };
  }, []);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const hashSectionIds = navItems
      .filter(({ href }) => href.startsWith("#"))
      .map(({ href }) => href.slice(1));

    const sections = hashSectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(`#${visibleEntry.target.id}`);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome]);

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
    if (isHome && href.startsWith("#")) {
      event.preventDefault();
      scrollToSection(href);
      return;
    }

    if (closeOnNavigate) {
      setIsOpen(false);
    }
  };

  const getNavHref = (href: string) => {
    if (isHome || !href.startsWith("#")) {
      return href;
    }
    return `/${href}`;
  };

  const isItemActive = (href: string) => {
    if (href.startsWith("#")) {
      return isHome && activeSection === href;
    }

    return location === href;
  };

  const desktopNavClasses = (href: string) =>
    [
      "inline-flex min-h-10 items-center rounded-full px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
      isItemActive(href)
        ? "bg-primary text-black"
        : "text-gray-200 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const mobileNavClasses = (href: string) =>
    [
      "block rounded-lg px-4 py-3 text-base font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
      isItemActive(href)
        ? "bg-primary text-black"
        : "text-white hover:bg-white/10 hover:text-primary",
    ].join(" ");

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-background/95 shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur"
          : "bg-black/35 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-20 w-full max-w-[1360px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href={getNavHref("#home")}
          onClick={(e) => {
            handleNavClick(e, "#home");
          }}
          className="flex shrink-0 items-center gap-2"
        >
          <img
            src={logo}
            alt="Stoned Goose Logo"
            className="h-12 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
          />
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex flex-nowrap items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={getNavHref(item.href)}
                onClick={(e) => {
                  handleNavClick(e, item.href);
                }}
                className={desktopNavClasses(item.href)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <div className="hidden items-center gap-1 xl:flex">
            {socialLinks.slice(0, 4).map(({ label, href, Icon }) => (
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

          <Button
            variant="default"
            className="min-h-10 rounded-full px-5 text-xs font-bold uppercase tracking-[0.14em] text-black"
            onClick={() => {
              if (isHome) {
                scrollToSection("#services");
                return;
              }
              setLocation("/#services");
            }}
          >
            Book Services
          </Button>
        </div>

        <div className="ml-auto lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full border border-white/20 text-white hover:border-primary hover:text-primary"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[320px] border-l border-white/15 bg-black/95 px-6"
            >
              <div className="mt-10 flex flex-col gap-6">
                <Button
                  className="min-h-11 rounded-full text-sm font-bold uppercase tracking-[0.14em] text-black"
                  onClick={() => {
                    if (isHome) {
                      scrollToSection("#services");
                      return;
                    }
                    setLocation("/#services");
                    setIsOpen(false);
                  }}
                >
                  Book Services
                </Button>

                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={getNavHref(item.href)}
                      onClick={(e) => {
                        handleNavClick(e, item.href, true);
                      }}
                      className={mobileNavClasses(item.href)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-white/10 pt-6">
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
