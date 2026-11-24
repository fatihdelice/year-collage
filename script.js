const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d');
const translations = {
    tr: {
        editPhoto: 'Fotoğrafı düzenle',
        photoTile: number => `${number}. fotoğrafı düzenle`,
        zoom: 'Yakınlaştırma',
        horizontalPosition: 'Sağa sola kaydır',
        resetCrop: 'Sıfırla',
        done: 'Tamam',
        title: 'Yıl Dönümü Kolajı',
        pageTitle: 'Yıl Dönümü Kolajı – Fotoğraf Kolajı Oluşturucu',
        description: '1. yıldan 9. yıla kadar yıl dönümünüz için bir fotoğraf kolajı hazırlayın ve 2400 × 3000 PNG olarak indirin. Fotoğraflar cihazınızda kalır.',
        language: 'Dil',
        intro: 'Yıl dönümünüzü seçin ve rakamı fotoğraflarınızla doldurun.',
        yearLabel: 'Kaçıncı yıl?',
        yearOption: year => `${year}. yıl`,
        drop: 'Fotoğrafları sürükleyin veya seçin',
        headingLabel: 'Dikey yazı',
        subtitleLabel: 'Alt yazı',
        heading: () => 'YIL',
        subtitle: 'seninle',
        background: 'Arka plan',
        gap: 'Fotoğraf aralığı',
        grayscale: 'Siyah beyaz',
        shuffle: 'Fotoğrafları karıştır',
        clear: 'Fotoğrafları temizle',
        download: 'Resmi indir (PNG)',
        footer: '2400 × 3000 px. Fotoğraflar cihazınızda işlenir.',
        empty: count => `Bu şablonda ${count} fotoğraf alanı var.`,
        loaded: count => `${count} fotoğraf yüklendi.`,
        repeat: 'Boş alanlar için fotoğraflar tekrarlanır.',
        limit: count => `İlk ${count} fotoğraf kullanılır.`,
        error: 'Bazı fotoğraflar açılamadı. JPG veya PNG deneyin.',
        filename: year => `${year}-yil-kolaji.png`
    },
    en: {
        editPhoto: 'Edit photo',
        photoTile: number => `Edit photo ${number}`,
        zoom: 'Zoom',
        horizontalPosition: 'Horizontal position',
        resetCrop: 'Reset',
        done: 'Done',
        title: 'Anniversary Collage',
        pageTitle: 'Anniversary Collage – Photo Collage Maker',
        description: 'Create a photo collage for your 1st through 9th anniversary and download a 2400 × 3000 PNG. Photos stay on your device.',
        language: 'Language',
        intro: 'Choose an anniversary year and add your photos to fill its number.',
        yearLabel: 'Anniversary year',
        yearOption: year => `${year}${['st', 'nd', 'rd'][year - 1] ?? 'th'} year`,
        drop: 'Drag photos here or choose files',
        headingLabel: 'Vertical text',
        subtitleLabel: 'Subtitle',
        heading: year => year === 1 ? 'YEAR' : 'YEARS',
        subtitle: 'with you',
        background: 'Background',
        gap: 'Photo spacing',
        grayscale: 'Black and white',
        shuffle: 'Shuffle photos',
        clear: 'Clear photos',
        download: 'Download image (PNG)',
        footer: '2400 × 3000 px. Photos are processed on your device.',
        empty: count => `This template has room for ${count} photos.`,
        loaded: count => `${count} ${count === 1 ? 'photo' : 'photos'} loaded.`,
        repeat: 'Photos are repeated to fill empty spaces.',
        limit: count => `Only the first ${count} photos are used.`,
        error: 'Some photos could not be opened. Try JPG or PNG.',
        filename: year => `${year}-year-collage.png`
    }
};
let language = 'en';
let year = 1;
const subtitleFont = '145px Allura, "Segoe Script", cursive';
const subtitleReady = document.fonts.load(subtitleFont).catch(() => {});

function setLanguage(nextLanguage) {
    const previous = translations[language];
    const current = translations[nextLanguage];
    if ($('heading').value === previous.heading(year)) $('heading').value = current.heading(year);
    if ($('subtitle').value === previous.subtitle) $('subtitle').value = current.subtitle;
    language = nextLanguage;
    $('language').value = language;
    document.documentElement.lang = language;
    document.title = current.pageTitle;
    document.querySelector('meta[name="description"]').content = current.description;
    $('language').setAttribute('aria-label', current.language);
    for (const option of $('year').options) {
        option.textContent = current.yearOption(Number(option.value));
    }
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = current[element.dataset.i18n];
    });
    render();
}
let photos = [];
// Each tile: column, row, width, height. 9 columns, 15 rows.
const firstYearTiles = [
    [3, 0, 1, 1], [4, 0, 2, 2], [1, 1, 1, 1], [2, 1, 2, 2],
    [0, 2, 2, 2], [4, 2, 1, 1], [5, 2, 1, 1], [2, 3, 1, 1], [3, 3, 1, 1], [4, 3, 1, 1], [5, 3, 1, 1],
    [3, 4, 2, 2], [5, 4, 1, 2], [3, 6, 1, 2], [4, 6, 2, 2],
    [3, 8, 2, 2], [5, 8, 1, 2], [3, 10, 1, 1], [4, 10, 1, 2], [5, 10, 1, 1], [3, 11, 1, 1], [5, 11, 1, 1],
    [0, 12, 1, 1], [1, 12, 1, 1], [2, 12, 2, 2], [4, 12, 1, 1], [5, 12, 1, 1], [6, 12, 2, 2], [8, 12, 1, 2],
    [0, 13, 2, 2], [4, 13, 2, 2], [2, 14, 1, 1], [3, 14, 1, 1], [6, 14, 1, 1], [7, 14, 1, 1], [8, 14, 1, 1]
];
// Each # is a photo tile. The digit occupies the left side of the poster.
const digitRows = {
    2: ['.####.', '######', '##..##', '....##', '...###', '..###.', '.###..', '###...', '##....', '##....', '######', '######'],
    3: ['.####.', '######', '##..##', '....##', '...###', '..###.', '..###.', '....##', '....##', '##..##', '######', '.####.'],
    4: ['...###', '..####', '..####', '.##.##', '.##.##', '##..##', '##..##', '######', '######', '....##', '....##', '....##'],
    5: ['######', '######', '##....', '##....', '#####.', '######', '....##', '....##', '....##', '##..##', '######', '.####.'],
    6: ['..###.', '.####.', '###...', '##....', '##....', '#####.', '######', '##..##', '##..##', '##..##', '######', '.####.'],
    7: ['######', '######', '....##', '...###', '...##.', '..###.', '..##..', '.###..', '.##...', '.##...', '.##...', '.##...'],
    8: ['.####.', '######', '##..##', '##..##', '.####.', '..##..', '.####.', '##..##', '##..##', '##..##', '######', '.####.'],
    9: ['.####.', '######', '##..##', '##..##', '##..##', '######', '.#####', '....##', '....##', '...###', '.####.', '.###..']
};
const layouts = [firstYearTiles, ...Object.values(digitRows).map(rows =>
    rows.flatMap((row, index) => Array.from(row).flatMap((cell, column) =>
        cell === '#' ? [[column, index + 1, 1, 1]] : []))
)];
let tiles = firstYearTiles;
const editor = $('crop-editor');
const preview = $('crop-preview');
const previewContext = preview.getContext('2d');
const defaultCrop = { zoom: 1, pan: 0 };
const cropsByYear = layouts.map(() => new Map());
let crops = cropsByYear[0];
let editedTile;

const tileButtons = Array.from({ length: Math.max(...layouts.map(layout => layout.length)) }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-tile';
    button.setAttribute('aria-haspopup', 'dialog');
    button.onclick = () => {
        editedTile = index;
        renderCropPreview();
        editor.showModal();
    };
    $('poster').append(button);
    return button;
});

function tileBounds([column, row, width, height], gap) {
    return [400 + column * 176 + gap / 2, 180 + row * 176 + gap / 2,
        width * 176 - gap, height * 176 - gap];
}

function cover(context, img, x, y, width, height, { zoom, pan }) {
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight) * zoom;
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const horizontalRoom = Math.max(0, img.naturalWidth - sourceWidth);
    context.filter = $('gray').checked ? 'grayscale(100%)' : 'none';
    context.drawImage(img, horizontalRoom * (1 - pan) / 2,
        Math.max(0, img.naturalHeight - sourceHeight) / 2,
        sourceWidth, sourceHeight, x, y, width, height);
}

function renderCropPreview() {
    const [, , width, height] = tileBounds(tiles[editedTile], Number($('gap').value) * 2);
    const photo = photos[editedTile % photos.length];
    const crop = crops.get(editedTile) ?? defaultCrop;
    preview.width = width;
    preview.height = height;
    $('crop-zoom').value = crop.zoom;
    $('crop-pan').value = crop.pan * 100;
    $('crop-pan').disabled = crop.zoom === 1 &&
        photo.naturalWidth * height <= photo.naturalHeight * width;
    cover(previewContext, photo, 0, 0, width, height, crop);
}

function updateCrop() {
    crops.set(editedTile, {
        zoom: Number($('crop-zoom').value),
        pan: Number($('crop-pan').value) / 100
    });
    renderCropPreview();
    render();
}

$('crop-zoom').oninput = updateCrop;
$('crop-pan').oninput = updateCrop;
let panDrag;
preview.onpointerdown = event => {
    if (event.button !== 0 || $('crop-pan').disabled) return;
    const photo = photos[editedTile % photos.length];
    const crop = crops.get(editedTile) ?? defaultCrop;
    const scale = Math.max(preview.width / photo.naturalWidth,
        preview.height / photo.naturalHeight) * crop.zoom;
    const travel = (photo.naturalWidth * scale / preview.width - 1) *
        preview.getBoundingClientRect().width;
    if (travel <= 0) return;
    panDrag = { x: event.clientX, pan: crop.pan, travel };
    preview.setPointerCapture(event.pointerId);
};
preview.onpointermove = event => {
    if (!panDrag || !preview.hasPointerCapture(event.pointerId)) return;
    const pan = panDrag.pan + 2 * (event.clientX - panDrag.x) / panDrag.travel;
    $('crop-pan').value = Math.round(100 * Math.max(-1, Math.min(1, pan)));
    updateCrop();
};
preview.onlostpointercapture = () => { panDrag = undefined; };
$('crop-reset').onclick = () => {
    crops.delete(editedTile);
    renderCropPreview();
    render();
};

function render() {
    const bg = $('bg').value; ctx.fillStyle = bg; ctx.fillRect(0, 0, 2400, 3000); const unit = 176, ox = 400, oy = 180, g = Number($('gap').value) * 2; const dark = parseInt(bg.slice(1, 3), 16) * .299 + parseInt(bg.slice(3, 5), 16) * .587 + parseInt(bg.slice(5, 7), 16) * .114 < 128;
    tileButtons.forEach((button, index) => {
        const tile = tiles[index];
        button.hidden = !tile || !photos.length;
        if (!tile) return;
        const [x, y, width, height] = tileBounds(tile, g);
        button.setAttribute('aria-label', translations[language].photoTile(index + 1));
        Object.assign(button.style, {
            left: `${100 * x / canvas.width}%`,
            top: `${100 * y / canvas.height}%`,
            width: `${100 * width / canvas.width}%`,
            height: `${100 * height / canvas.height}%`
        });
        if (photos.length) {
            ctx.save();
            cover(ctx, photos[index % photos.length], x, y, width, height,
                crops.get(index) ?? defaultCrop);
            ctx.restore();
        } else {
            ctx.fillStyle = dark ? '#555' : '#e8e6e3';
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = dark ? '#ddd' : '#aaa';
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index + 1, x + width / 2, y + height / 2);
        }
    });
    ctx.fillStyle = dark ? '#fff' : '#171717'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 180px Arial,sans-serif'; const chars = Array.from($('heading').value.toLocaleUpperCase(language)); const step = Math.min(350, 1250 / Math.max(1, chars.length)); chars.forEach((ch, i) => ctx.fillText(ch, ox + 6.85 * unit, oy + 3.1 * unit + i * step)); ctx.textAlign = 'left'; ctx.font = subtitleFont; ctx.fillText($('subtitle').value, ox + 6.25 * unit, oy + 10.85 * unit, 540);
    $('download').disabled = !photos.length;
    const copy = translations[language];
    let status = photos.length ? copy.loaded(photos.length) : copy.empty(tiles.length);
    if (photos.length && photos.length < tiles.length) status += ' ' + copy.repeat;
    if (photos.length > tiles.length) status += ' ' + copy.limit(tiles.length);
    $('count').textContent = status;
}
async function load(list) {const results = await Promise.allSettled(Array.from(list).filter(f => f.type.startsWith('image/')).map(f => new Promise((resolve, reject) => {const url = URL.createObjectURL(f), img = new Image(); img.onload = () => {URL.revokeObjectURL(url); resolve(img)}; img.onerror = () => {URL.revokeObjectURL(url); reject(new Error('Image error'))}; img.src = url;}))); photos.push(...results.filter(r => r.status === 'fulfilled').map(r => r.value)); render(); if (results.some(r => r.status === 'rejected')) alert(translations[language].error);}
$('drop').onclick = () => $('files').click(); $('files').onclick = e => e.stopPropagation(); $('drop').onkeydown = e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); $('files').click();} }; $('files').onchange = async e => {await load(e.target.files); e.target.value = '';}; $('drop').ondragover = e => {e.preventDefault(); $('drop').classList.add('over')}; $('drop').ondragleave = () => $('drop').classList.remove('over'); $('drop').ondrop = e => {e.preventDefault(); $('drop').classList.remove('over'); load(e.dataTransfer.files)};
['heading', 'subtitle', 'bg', 'gap', 'gray'].forEach(id => $(id).addEventListener('input', render)); $('shuffle').onclick = () => {for (let i = photos.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1));[photos[i], photos[j]] = [photos[j], photos[i]];} render();}; $('clear').onclick = () => {photos = []; render()};
$('download').onclick = async () => {
    await subtitleReady;
    if (!photos.length) return;
    render();
    const filename = translations[language].filename(year);
    canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
};
$('language').onchange = event => setLanguage(event.target.value);
$('year').onchange = event => {
    const nextYear = Number(event.target.value);
    const copy = translations[language];
    if ($('heading').value === copy.heading(year)) $('heading').value = copy.heading(nextYear);
    year = nextYear;
    tiles = layouts[year - 1];
    crops = cropsByYear[year - 1];
    render();
};
for (const id of ['shuffle', 'clear']) {
    $(id).addEventListener('click', () => cropsByYear.forEach(yearCrops => yearCrops.clear()), { capture: true });
}
setLanguage(language);
subtitleReady.then(render);
