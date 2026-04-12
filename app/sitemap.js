export default function sitemap() {
  const base = "https://safuu.net";
  const now  = new Date();
  return [
    { url:`${base}`,               lastModified:now, changeFrequency:"daily",   priority:1    },
    { url:`${base}/transparency`,  lastModified:now, changeFrequency:"daily",   priority:0.9  },
    { url:`${base}/report`,        lastModified:now, changeFrequency:"weekly",  priority:0.95 },
    { url:`${base}/analytics`,     lastModified:now, changeFrequency:"daily",   priority:0.8  },
    { url:`${base}/about`,         lastModified:now, changeFrequency:"monthly", priority:0.7  },
    { url:`${base}/sms`,           lastModified:now, changeFrequency:"monthly", priority:0.65 },
    { url:`${base}/partners`,      lastModified:now, changeFrequency:"monthly", priority:0.6  },
    { url:`${base}/press`,         lastModified:now, changeFrequency:"monthly", priority:0.6  },
    { url:`${base}/privacy`,       lastModified:now, changeFrequency:"yearly",  priority:0.4  },
  ];
}
