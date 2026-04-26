export type Product = {
  name: string;
  price: string;
  url: string;
  image: string;
};

const FW = "https://stoned-goose-productions-zgm-shop.fourthwall.com";

// Product images live on Fourthwall's imgproxy CDN. We embed them directly so
// the build stays static. No hotlinking concerns since they're public CDN.
//
// TODO(owner): products with `image: ""` are hidden from /shop until URLs land.
// Open the product on Fourthwall, copy the imgproxy URL, paste it here.
export const products: Product[] = [
  {
    name: "Metal Goose",
    price: "$20.00",
    url: `${FW}/products/metal-goose`,
    image:
      "https://imgproxy.fourthwall.com/nK-fkZy-5MEkDLgk8xIgoQq36Y24jQ1ZqxdL_mEcEJo/w:720/sm:1/enc/Gu1IR7MUbcgba4BR/VUFOWu2YdDg_bxKR/1BO009Oyox07oSwj/2Vd8TBKaNocVdaCQ/F6J4LL9NRD-ARSe2/XEEN-00bk0ioA8PG/WRFFyn3A9my1icUo/FIwRmUeTpAM9VMZZ/A796akSBBbnre5hF/pYKImNbjI-dYMXuR/84dTf0mpp1MIVwWC/M5oEl2rlTrPhLSl3/pnS4W5-Az_Ys0VwA/ulG6VEoXbjWzDdqN/BA2Zcjxyf54",
  },
  {
    name: "LOGO Hoodie",
    price: "$29.00",
    url: `${FW}/products/logo-hoodie`,
    image:
      "https://imgproxy.fourthwall.com/IzxPYUtLlWWb7GIA724u79IZ-mfpp0WJzq-7bXOtAXc/w:720/sm:1/enc/nlub6SC6F-XwZu4s/cO4uq50ELA_bpBJZ/ZAe1zpmZZdJyZT_E/4HAtAF84_G9PVQle/nGB8SuBzvPFA5JcZ/rF09JPww9_u4GUZa/Ze92kTjkBVtIdDGL/kWRsvL5dqqXLfY8b/xMxGSJ4XUsCne5Ln/0sBEZYHn92ZRFtxt/Um-KED7e1L-BH00X/miAUqR2M-9t0Qg3k/U4415CkejZhF9V6u/jDoKi8u9oDrIKgc8/mcCKeA9dTOo",
  },
  {
    name: "Sick Hat",
    price: "$18.50",
    url: `${FW}/products/sick-hat`,
    image:
      "https://imgproxy.fourthwall.com/xVX63E9ebyPcCc2kiCj74mUBq6gFgq9HqYlswMwnMO4/w:720/sm:1/enc/WpBg2905LccQle1j/ImWNDBsu_u3OhxMr/Wd1G3jUPdk9Xc6tQ/p17vBm57d-MmdUed/Z2YnFRxEN6VCDsyH/bpSJWZWnCVP-3lfG/a9w90hR2L2UxS-Wn/TrS7WdUtLUHENs8n/keBHUO9hfTYfBTT6/qEKu2Yv5KOIxtWJc/qha8URNi06B2o0Fn/MK-x9u9sljpd1c_q/Zt3H7I9gR_vXjhCh/TXKFRul35dDrhb1w/Rxx8qk41WFg",
  },
  {
    name: "Shoe Underwear",
    price: "$15.00",
    url: `${FW}/products/shoe-underwear`,
    image: "",
  },
  {
    name: "Liquid Holder",
    price: "$13.00",
    url: `${FW}/products/liquid-holder`,
    image: "",
  },
  {
    name: "The Goose is Loose",
    price: "$25.00",
    url: `${FW}/products/the-goose-is-loose`,
    image: "",
  },
  {
    name: "Coffee Cup For You",
    price: "$11.00",
    url: `${FW}/products/coffe`,
    image: "",
  },
  {
    name: "Booootle",
    price: "$23.00",
    url: `${FW}/products/booootle`,
    image: "",
  },
  {
    name: "F**kin Hippies",
    price: "$30.00",
    url: `${FW}/products/f-kin-hippies`,
    image: "",
  },
  {
    name: "80's Goose",
    price: "$12.50",
    url: `${FW}/products/80s-goose`,
    image: "",
  },
  {
    name: "Logo Hoodless Hoodie",
    price: "$32.00",
    url: `${FW}/products/logo-hoodless-hoodie`,
    image: "",
  },
  {
    name: "Brendan's Fart Hat",
    price: "$26.66",
    url: `${FW}/products/brendans-fart-hat`,
    image: "",
  },
  {
    name: "Puffy Hat",
    price: "$23.45",
    url: `${FW}/products/puffy-hat`,
    image: "",
  },
  {
    name: "Tuque or Something",
    price: "$16.50",
    url: `${FW}/products/tuque-or-something`,
    image: "",
  },
  {
    name: "Joke Book",
    price: "$16.00",
    url: `${FW}/products/joke-book`,
    image: "",
  },
  {
    name: "Portrait Tote",
    price: "$19.00",
    url: `${FW}/products/portrait-tote`,
    image: "",
  },
  {
    name: "Buttons",
    price: "$11.25",
    url: `${FW}/products/buttons`,
    image: "",
  },
  {
    name: "LIVE LOCAL COMEDY Sticker",
    price: "$5.20",
    url: `${FW}/products/live-local-comedy-sticker`,
    image: "",
  },
];

export const shopCopy = {
  heading: "Fresh Merch",
  subhead: "Rep the Goose. Look cool. Be happy.",
  collectionUrl: `${FW}/collections/og-bigboy`,
  storeUrl: FW,
};
