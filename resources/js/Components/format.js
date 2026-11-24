// ফি বাংলা সংখ্যায়: ১০০০০ → ১০,০০০/=
export const taka = (n) => `${Number(n || 0).toLocaleString('bn-BD')}/=`;
