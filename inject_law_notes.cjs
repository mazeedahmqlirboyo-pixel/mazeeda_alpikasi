const fs = require('fs');
const path = require('path');

const translations = {
    id: {
        intro: "Perhitungan ini berdasarkan kesepakatan jumhur ulama Sunni. Urutan prioritas kewajiban sebelum harta waris dibagi adalah:",
        list_1: "Melunasi biaya pengurusan jenazah (tajhiz).",
        list_2: "Melunasi hutang piutang pewaris, baik kepada manusia maupun kepada Allah (zakat, nazar).",
        list_3: "Menunaikan wasiat pewaris (maksimal 1/3 dari sisa harta bersih).",
        disclaimer: "Disarankan untuk melakukan konsultasi lanjut dengan Ustadz / Pengadilan Agama setempat untuk detail kasus waris yang rumit."
    },
    en: {
        intro: "This calculation is based on the consensus of the majority of Sunni scholars. The priority order of obligations before the inheritance is divided is:",
        list_1: "Paying for funeral expenses (tajhiz).",
        list_2: "Settling the debts of the deceased, both to humans and to Allah (zakat, vows).",
        list_3: "Fulfilling the will of the deceased (maximum 1/3 of the net estate).",
        disclaimer: "It is recommended to consult further with a local Ustadz / Religious Court for complex inheritance cases."
    },
    ar: {
        intro: "يستند هذا الحساب إلى إجماع جمهور علماء السنة. ترتيب أولوية الالتزامات قبل تقسيم التركة هو:",
        list_1: "تسديد نفقات الجنازة والتجهيز.",
        list_2: "تسديد ديون المتوفى، سواء للعباد أو لله (الزكاة، النذور).",
        list_3: "تنفيذ وصية المتوفى (بحد أقصى ثلث التركة الصافية).",
        disclaimer: "يُنصح بمزيد من الاستشارة مع أستاذ / محكمة شرعية محلية لقضايا الميراث المعقدة."
    },
    zh: {
        intro: "此计算基于多数逊尼派学者的共识。在分配遗产之前的义务优先顺序为：",
        list_1: "支付丧葬费用 (tajhiz)。",
        list_2: "清偿死者的债务，包括对人或对真主的债务 (天课、还愿)。",
        list_3: "履行死者的遗嘱 (最多为净遗产的1/3)。",
        disclaimer: "对于复杂的继承案件，建议进一步咨询当地的宗教学者 (Ustadz) / 宗教法庭。"
    },
    ja: {
        intro: "この計算は、スンニ派の多数の学者の合意に基づいています。遺産を分配する前の義務の優先順位は次のとおりです。",
        list_1: "葬儀費用 (tajhiz) の支払い。",
        list_2: "故人の負債の清算（人間に対するものとアッラーに対するもの（ザカート、誓い）の両方）。",
        list_3: "故人の遺言の履行（純資産の最大1/3まで）。",
        disclaimer: "複雑な相続問題については、地元のウスタズ / 宗教裁判所にさらに相談することをお勧めします。"
    },
    ko: {
        intro: "이 계산은 수니파 다수 학자들의 합의를 바탕으로 합니다. 유산을 분배하기 전 의무의 우선순위는 다음과 같습니다:",
        list_1: "장례 비용(tajhiz) 지불.",
        list_2: "사람과 알라(자카트, 맹세) 모두에게 진 고인의 빚 청산.",
        list_3: "고인의 유언 이행(순 자산의 최대 1/3).",
        disclaimer: "복잡한 상속 사건의 경우 현지 우스타즈 / 종교 법원과 추가로 상담하는 것이 좋습니다."
    }
};

const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!data.faraidh) data.faraidh = {};
    if (!data.faraidh.law_notes) data.faraidh.law_notes = {};
    
    data.faraidh.law_notes.intro = translations[lang].intro;
    data.faraidh.law_notes.list_1 = translations[lang].list_1;
    data.faraidh.law_notes.list_2 = translations[lang].list_2;
    data.faraidh.law_notes.list_3 = translations[lang].list_3;
    data.faraidh.law_notes.disclaimer = translations[lang].disclaimer;
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
});

console.log("Injected Law Notes to i18n");
