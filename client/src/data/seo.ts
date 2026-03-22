export const SITE_URL = "https://www.stonedgooseproductions.com";

export const AREA_SERVED = [
  "Olympia, WA",
  "Lacey, WA",
  "Tacoma, WA",
  "South Sound",
  "Thurston County, WA",
  "Pierce County, WA",
];

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Stoned Goose Productions",
  url: SITE_URL,
  areaServed: AREA_SERVED,
  sameAs: [
    "https://www.instagram.com/stonedgooseproductions/",
    "https://www.facebook.com/profile.php?id=61573095812128",
    "https://www.tiktok.com/@stonedgooseproductions?_t=zt-8xjcguh7awp&_r=1",
    "https://www.youtube.com/@stonedgooseproductions",
    "https://www.patreon.com/cw/StonedGooseProductions",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "Sales",
      email: "kyle@stonedgooseproductions.com",
      telephone: "+13603230667",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Olympia",
    addressRegion: "WA",
    addressCountry: "US",
  },
};
