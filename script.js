const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d');
const translations = {
    tr: {
        title: '1 Yıl Kolajı',
        pageTitle: '1 Yıl Kolajı – Yıl Dönümü Fotoğraf Kolajı Oluşturucu',
        description: '36 fotoğrafa kadar ekleyerek ilk yıl dönümünüz için bir kolaj hazırlayın. Posterinizi özelleştirin ve 2400 × 3000 PNG olarak indirin. Fotoğraflar cihazınızda kalır.',
        language: 'Dil',
        intro: 'Birlikte geçirdiğiniz ilk yılı 36 fotoğrafa kadar ekleyebileceğiniz bir yıl dönümü kolajına dönüştürün.',
        drop: 'Fotoğrafları sürükleyin veya seçin',
        headingLabel: 'Dikey yazı',
        subtitleLabel: 'Alt yazı',
        heading: 'YIL',
        subtitle: 'seninle',
        background: 'Arka plan',
        gap: 'Fotoğraf aralığı',
        grayscale: 'Siyah beyaz',
        shuffle: 'Fotoğrafları karıştır',
        clear: 'Fotoğrafları temizle',
        download: 'Resmi indir (PNG)',
        footer: '2400 × 3000 px. Fotoğraflar cihazınızda işlenir.',
        empty: 'Henüz fotoğraf yok. 36 fotoğraf ideal.',
        loaded: count => `${count} fotoğraf yüklendi.`,
        repeat: 'Boş alanlar için fotoğraflar tekrarlanır.',
        limit: 'İlk 36 fotoğraf kullanılır.',
        error: 'Bazı fotoğraflar açılamadı. JPG veya PNG deneyin.',
        filename: '1-yil-kolaji.png'
    },
    en: {
        title: '1 Year Collage',
        pageTitle: '1 Year Collage – Anniversary Photo Collage Maker',
        description: 'Create a first anniversary photo collage with up to 36 photos. Customize your poster and download a 2400 × 3000 PNG. Photos stay on your device.',
        language: 'Language',
        intro: 'Turn your first year together into an anniversary photo collage with up to 36 photos.',
        drop: 'Drag photos here or choose files',
        headingLabel: 'Vertical text',
        subtitleLabel: 'Subtitle',
        heading: 'YEAR',
        subtitle: 'with you',
        background: 'Background',
        gap: 'Photo spacing',
        grayscale: 'Black and white',
        shuffle: 'Shuffle photos',
        clear: 'Clear photos',
        download: 'Download image (PNG)',
        footer: '2400 × 3000 px. Photos are processed on your device.',
        empty: 'No photos yet. 36 photos is ideal.',
        loaded: count => `${count} ${count === 1 ? 'photo' : 'photos'} loaded.`,
        repeat: 'Photos are repeated to fill empty spaces.',
        limit: 'Only the first 36 photos are used.',
        error: 'Some photos could not be opened. Try JPG or PNG.',
        filename: '1-year-collage.png'
    }
};
let language = 'en';
const subtitleFont = '145px Allura, "Segoe Script", cursive';
const subtitleReady = document.fonts.load(subtitleFont).catch(() => {});

function setLanguage(nextLanguage) {
    const previous = translations[language];
    const current = translations[nextLanguage];
    for (const field of ['heading', 'subtitle']) {
        if ($(field).value === previous[field]) $(field).value = current[field];
    }
    language = nextLanguage;
    $('language').value = language;
    document.documentElement.lang = language;
    document.title = current.pageTitle;
    document.querySelector('meta[name="description"]').content = current.description;
    $('language').setAttribute('aria-label', current.language);
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = current[element.dataset.i18n];
    });
    render();
}
let photos = [];
// Each tile: column, row, width, height. 9 columns, 15 rows.
const tiles = [
    [3, 0, 1, 1], [4, 0, 2, 2], [1, 1, 1, 1], [2, 1, 2, 2],
    [0, 2, 2, 2], [4, 2, 1, 1], [5, 2, 1, 1], [2, 3, 1, 1], [3, 3, 1, 1], [4, 3, 1, 1], [5, 3, 1, 1],
    [3, 4, 2, 2], [5, 4, 1, 2], [3, 6, 1, 2], [4, 6, 2, 2],
    [3, 8, 2, 2], [5, 8, 1, 2], [3, 10, 1, 1], [4, 10, 1, 2], [5, 10, 1, 1], [3, 11, 1, 1], [5, 11, 1, 1],
    [0, 12, 1, 1], [1, 12, 1, 1], [2, 12, 2, 2], [4, 12, 1, 1], [5, 12, 1, 1], [6, 12, 2, 2], [8, 12, 1, 2],
    [0, 13, 2, 2], [4, 13, 2, 2], [2, 14, 1, 1], [3, 14, 1, 1], [6, 14, 1, 1], [7, 14, 1, 1], [8, 14, 1, 1]
];
function cover(img, x, y, w, h) {const s = Math.max(w / img.naturalWidth, h / img.naturalHeight); const sw = w / s, sh = h / s; ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);}
function render() {
    const bg = $('bg').value; ctx.fillStyle = bg; ctx.fillRect(0, 0, 2400, 3000); const unit = 176, ox = 400, oy = 180, g = Number($('gap').value) * 2; const dark = parseInt(bg.slice(1, 3), 16) * .299 + parseInt(bg.slice(3, 5), 16) * .587 + parseInt(bg.slice(5, 7), 16) * .114 < 128;
    tiles.forEach(([c, r, w, h], i) => {const x = ox + c * unit + g / 2, y = oy + r * unit + g / 2, tw = w * unit - g, th = h * unit - g; if (photos.length) {ctx.save(); ctx.filter = $('gray').checked ? 'grayscale(100%)' : 'none'; cover(photos[i % photos.length], x, y, tw, th); ctx.restore();} else {ctx.fillStyle = dark ? '#555' : '#e8e6e3'; ctx.fillRect(x, y, tw, th); ctx.fillStyle = dark ? '#ddd' : '#aaa'; ctx.font = '32px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, x + tw / 2, y + th / 2);} });
    ctx.fillStyle = dark ? '#fff' : '#171717'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 180px Arial,sans-serif'; const chars = Array.from($('heading').value.toLocaleUpperCase(language)); const step = Math.min(350, 1250 / Math.max(1, chars.length)); chars.forEach((ch, i) => ctx.fillText(ch, ox + 6.85 * unit, oy + 3.1 * unit + i * step)); ctx.textAlign = 'left'; ctx.font = subtitleFont; ctx.fillText($('subtitle').value, ox + 6.25 * unit, oy + 10.85 * unit, 540);
    $('download').disabled = !photos.length;
    const copy = translations[language];
    let status = photos.length ? copy.loaded(photos.length) : copy.empty;
    if (photos.length && photos.length < tiles.length) status += ' ' + copy.repeat;
    if (photos.length > tiles.length) status += ' ' + copy.limit;
    $('count').textContent = status;
}
async function load(list) {const results = await Promise.allSettled(Array.from(list).filter(f => f.type.startsWith('image/')).map(f => new Promise((resolve, reject) => {const url = URL.createObjectURL(f), img = new Image(); img.onload = () => {URL.revokeObjectURL(url); resolve(img)}; img.onerror = () => {URL.revokeObjectURL(url); reject(new Error('Image error'))}; img.src = url;}))); photos.push(...results.filter(r => r.status === 'fulfilled').map(r => r.value)); render(); if (results.some(r => r.status === 'rejected')) alert(translations[language].error);}
$('drop').onclick = () => $('files').click(); $('files').onclick = e => e.stopPropagation(); $('drop').onkeydown = e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); $('files').click();} }; $('files').onchange = async e => {await load(e.target.files); e.target.value = '';}; $('drop').ondragover = e => {e.preventDefault(); $('drop').classList.add('over')}; $('drop').ondragleave = () => $('drop').classList.remove('over'); $('drop').ondrop = e => {e.preventDefault(); $('drop').classList.remove('over'); load(e.dataTransfer.files)};
['heading', 'subtitle', 'bg', 'gap', 'gray'].forEach(id => $(id).addEventListener('input', render)); $('shuffle').onclick = () => {for (let i = photos.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1));[photos[i], photos[j]] = [photos[j], photos[i]];} render();}; $('clear').onclick = () => {photos = []; render()}; $('download').onclick = async () => {await subtitleReady; render(); canvas.toBlob(blob => {if (!blob) return; const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = translations[language].filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);}, 'image/png')};
$('language').onchange = event => setLanguage(event.target.value);
setLanguage(language);
subtitleReady.then(render);
