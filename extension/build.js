const fs = require('fs-extra');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const archiver = require('archiver');

const SRC_DIR = path.join(__dirname);
const DIST_DIR = path.join(__dirname, 'dist');
const ZIP_PATH = path.join(__dirname, '..', 'cortex-extension-prod.zip');

async function build() {
    console.log('Spoczko, budujemy mroczną paczkę Cortex...');

    if (await fs.pathExists(DIST_DIR)) {
        await fs.remove(DIST_DIR);
    }
    await fs.ensureDir(DIST_DIR);

    const filesToCopy = [
        'manifest.json',
        'popup.html',
        'popup.js',
        'options.html',
        'options.js',
        'assets',
        '_locales'
    ];

    for (const item of filesToCopy) {
        if (await fs.pathExists(path.join(SRC_DIR, item))) {
            await fs.copy(path.join(SRC_DIR, item), path.join(DIST_DIR, item));
        }
    }

    const jsFilesToCopy = ['background.js', 'contentScript.js'];

    for (const file of jsFilesToCopy) {
        if (await fs.pathExists(path.join(SRC_DIR, file))) {
            console.log(`Kopiowanie pliku (bez obfuzkacji): ${file}...`);
            await fs.copy(path.join(SRC_DIR, file), path.join(DIST_DIR, file));
        }
    }

    console.log('Pakowanie do ZIP...');
    const output = fs.createWriteStream(ZIP_PATH);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function () {
        console.log(`Sukces! Paczka gotowa: ${ZIP_PATH} (${archive.pointer()} bajtów)`);
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);
    archive.directory(DIST_DIR, false);
    await archive.finalize();
}

build().catch(err => {
    console.error('Błąd podczas budowania: ', err);
});
