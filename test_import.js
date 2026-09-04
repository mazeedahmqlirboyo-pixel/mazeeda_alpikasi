(async () => {
  try {
    const n2words = (await import('n2words')).default;
    console.log("en:", n2words(123, {lang: 'en'}));
    console.log("ar:", n2words(123, {lang: 'ar'}));
    console.log("id:", n2words(123, {lang: 'id'}));
    console.log("ko:", n2words(123, {lang: 'ko'}));
    console.log("zh:", n2words(123, {lang: 'zh'}));
    console.log("ja:", n2words(123, {lang: 'ja'}));
  } catch (e) {
    console.error(e);
  }
})();
