export default function sitemap() {
  return [
    { url:"https://safuu.net",              lastModified:new Date(), changeFrequency:"weekly",  priority:1   },
    { url:"https://safuu.net/transparency", lastModified:new Date(), changeFrequency:"daily",   priority:0.9 },
  ];
}
