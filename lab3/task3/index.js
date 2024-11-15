const fs = require("fs");
const path = require("path");

class MultiFileArchive {
    constructor(signature) {
        this.signature = signature;
        this.versionMajor = 1;         // Основная версия формата
        this.versionMinor = 0;         // Минорная версия формата
        this.compressionCode = 0;      // Код алгоритма сжатия (0 — без сжатия)
        this.errorProtectionCode = 0;  // Код защиты от помех (0 — без защиты)
    }

    encode(filePaths, outputArchivePath) {
        let headerSize = 6 + 2 + 1 + 1 + 4;
        const fileDataBuffers = [];

        filePaths.forEach(filePath => {
            const relativePath = path.relative(process.cwd(), filePath);
            const fileContent = fs.readFileSync(filePath);

            const pathBuffer = Buffer.from(relativePath, 'utf-8');
            const dataBuffer = Buffer.from(fileContent);

            headerSize += 2 + pathBuffer.length + 8;
            fileDataBuffers.push({ pathBuffer, dataBuffer });
        });

        const archiveBuffer = Buffer.alloc(headerSize + fileDataBuffers.reduce((sum, f) => sum + f.dataBuffer.length, 0));

        let offset = 0;
        archiveBuffer.write(this.signature, offset, 6, 'utf-8');
        offset += 6;

        archiveBuffer.writeUInt8(this.versionMajor, offset++);
        archiveBuffer.writeUInt8(this.versionMinor, offset++);

        archiveBuffer.writeUInt8(this.compressionCode, offset++);
        archiveBuffer.writeUInt8(this.errorProtectionCode, offset++);

        archiveBuffer.writeUInt32BE(fileDataBuffers.length, offset);
        offset += 4;

        fileDataBuffers.forEach(file => {
            archiveBuffer.writeUInt16BE(file.pathBuffer.length, offset);
            offset += 2;
            file.pathBuffer.copy(archiveBuffer, offset);
            offset += file.pathBuffer.length;

            archiveBuffer.writeBigUInt64BE(BigInt(file.dataBuffer.length), offset);
            offset += 8;

            file.dataBuffer.copy(archiveBuffer, offset);
            offset += file.dataBuffer.length;
        });

        fs.writeFileSync(outputArchivePath, archiveBuffer);
        console.log(`Архив создан: ${outputArchivePath}`);
    }

    decode(archivePath) {
        const archiveBuffer = fs.readFileSync(archivePath);
        let offset = 0;

        const signature = archiveBuffer.slice(offset, offset + 6).toString('utf-8');
        offset += 6;
        if (signature !== this.signature) {
            throw new Error('Неверная сигнатура архива');
        }

        const versionMajor = archiveBuffer.readUInt8(offset++);
        const versionMinor = archiveBuffer.readUInt8(offset++);

        const compressionCode = archiveBuffer.readUInt8(offset++);
        const errorProtectionCode = archiveBuffer.readUInt8(offset++);

        const fileCount = archiveBuffer.readUInt32BE(offset);
        offset += 4;

        const files = [];

        for (let i = 0; i < fileCount; i++) {
            const pathLength = archiveBuffer.readUInt16BE(offset);
            offset += 2;
            const filePath = archiveBuffer.slice(offset, offset + pathLength).toString('utf-8');
            offset += pathLength;

            const dataLength = Number(archiveBuffer.readBigUInt64BE(offset));
            offset += 8;

            const fileData = archiveBuffer.slice(offset, offset + dataLength);
            offset += dataLength;

            const fullPath = path.resolve(filePath);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, fileData);

            files.push({ path: fullPath, data: fileData });
        }

        console.log("Файлы успешно извлечены:", files.map(f => f.path));
    }
}

// Обработка параметров командной строки
const args = process.argv.slice(2);
const archive = new MultiFileArchive("ALEXEY");

if (args[0] === "encode") {
    // Команда для создания архива
    const outputArchivePath = args[1];    // Путь к архиву, например "archive.otikAD"
    const filePaths = args.slice(2);      // Список файлов для архивации

    if (!outputArchivePath || filePaths.length === 0) {
        console.error("Использование: node archiveScript.js encode <путь_к_архиву> <список_файлов>");
        process.exit(1);
    }

    archive.encode(filePaths, outputArchivePath);

} else if (args[0] === "decode") {
    // Команда для извлечения архива
    const archivePath = args[1];  // Путь к архиву, например "archive.otikAD"

    if (!archivePath) {
        console.error("Использование: node archiveScript.js decode <путь_к_архиву>");
        process.exit(1);
    }

    archive.decode(archivePath);

} else {
    console.error("Неизвестная команда. Использование: ");
    console.error("  Создать архив: node archiveScript.js encode <путь_к_архиву> <список_файлов>");
    console.error("  Извлечь архив: node archiveScript.js decode <путь_к_архиву>");
}
