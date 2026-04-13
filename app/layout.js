import { Playfair_Display, Space_Grotesk, Bebas_Neue } from "next/font/google";

const playfair = Playfair_Display({ subsets:["latin"], weight:["700","800","900"], style:["normal","italic"], variable:"--font-display", display:"swap" });
const grotesk  = Space_Grotesk({ subsets:["latin"], weight:["300","400","500","600","700"], variable:"--font-body", display:"swap" });
const bebas    = Bebas_Neue({ subsets:["latin"], weight:["400"], variable:"--font-headline", display:"swap" });

export const metadata = {
  title:"SAFUU — ሳፉ | Ethiopian Anti-Corruption Platform",
  description:"Anonymous anti-corruption intelligence platform for Ethiopia. Report bribery, land fraud, and abuse of power in any Ethiopian language.",
  openGraph:{
    title:"SAFUU — ሳፉ | Ethiopian Anti-Corruption Platform",
    description:"Report anonymously. Identity never stored. Court-ready evidence.",
    url:"https://safuu.net", siteName:"Safuu Intel", locale:"en_ET", type:"website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${grotesk.variable} ${bebas.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23030507'/><line x1='50' y1='15' x2='50' y2='85' stroke='%23c9a84c' stroke-width='5' stroke-linecap='round'/><line x1='22' y1='32' x2='78' y2='32' stroke='%23c9a84c' stroke-width='5' stroke-linecap='round'/><path d='M22 32 L10 56 Q22 68 34 56 Z' fill='none' stroke='%23c9a84c' stroke-width='4' stroke-linejoin='round'/><path d='M78 32 L66 56 Q78 68 90 56 Z' fill='none' stroke='%23c9a84c' stroke-width='4' stroke-linejoin='round'/><line x1='38' y1='85' x2='62' y2='85' stroke='%23c9a84c' stroke-width='5' stroke-linecap='round'/></svg>"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="theme-color" content="#030507"/>
      </head>
      <body style={{ margin:0, padding:0, background:"#030507" }}>{children}</body>
    </html>
  );
}
