export default function sitemap() {
  const base = "https://safuu.net";
  const now  = new Date();
  const pages = [
    ["/",              "daily",   1   ],
    ["/transparency",  "daily",   0.9 ],
    ["/report",        "weekly",  0.95],
    ["/analytics",     "daily",   0.8 ],
    ["/am",            "monthly", 0.75],
    ["/or",            "monthly", 0.75],
    ["/ti",            "monthly", 0.75],
    ["/about",         "monthly", 0.7 ],
    ["/sms",           "monthly", 0.65],
    ["/partners",      "monthly", 0.6 ],
    ["/press",         "monthly", 0.6 ],
    ["/changelog",     "weekly",  0.5 ],
    ["/privacy",       "yearly",  0.4 ],
  ];
  return pages.map(([url, freq, pri]) => ({
    url:`${base}${url}`, lastModified:now, changeFrequency:freq, priority:pri,
  }));
}
