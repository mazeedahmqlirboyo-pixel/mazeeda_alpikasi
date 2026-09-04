function getHijriInfo(date) {
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const yy = date.getFullYear();
    const mpart = (mm - 11) / 12;
    let jd = Math.floor((1461 * (yy + 4800 + Math.floor(mpart))) / 4) +
             Math.floor((367 * (mm - 2 - 12 * Math.floor(mpart))) / 12) -
             Math.floor((3 * Math.floor((yy + 4900 + Math.floor(mpart)) / 100)) / 4) +
             dd - 32075;
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const hm = Math.floor((24 * l) / 709);
    const hd = l - Math.floor((709 * hm) / 24);
    const hy = 30 * n + j - 30;

    const INDO_HIJRI_MONTHS = ["Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"];
    return { day: hd.toString(), month: INDO_HIJRI_MONTHS[hm-1], year: hy.toString() };
}

console.log("August 9, 2026: ", getHijriInfo(new Date(2026, 7, 9)));
console.log("August 1, 2026: ", getHijriInfo(new Date(2026, 7, 1)));
console.log("August 31, 2026: ", getHijriInfo(new Date(2026, 7, 31)));
