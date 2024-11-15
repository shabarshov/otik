const fs = require("fs");
const path = require("path");

// Размеры полей в байтах
const SIGNATURE_SIZE = 6;
const VERSION_SIZE = 2;
const COMPRESSION_CODE_SIZE = 1;
const ERROR_PROTECTION_CODE_SIZE = 1;
const FILE_LENGTH_SIZE = 8;

class Archive {
    constructor(signature) {
        this.signature = signature;
        this.versionMajor = 1;
        this.versionMinor = 0;
        this.compressionCode = 0; // 0 — отсутствие сжатия
        this.errorProtectionCode = 0; // 0 — отсутствие защиты от помех
    }

    encode(fileData) {
        const encoder = new TextEncoder();
        const rawData = encoder.encode(fileData);

        // Считаем длину исходного файла
        const fileLength = rawData.length;

        // Создаем архив с обновленной структурой
        const archiveBuffer = new ArrayBuffer(
            SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE + ERROR_PROTECTION_CODE_SIZE + FILE_LENGTH_SIZE + fileLength
        );
        const view = new DataView(archiveBuffer);

        // Записываем сигнатуру
        for (let i = 0; i < SIGNATURE_SIZE; i++) {
            view.setUint8(i, this.signature.charCodeAt(i) || 0);
        }

        // Записываем версию формата (основная и минорная версии)
        view.setUint8(SIGNATURE_SIZE, this.versionMajor);
        view.setUint8(SIGNATURE_SIZE + 1, this.versionMinor);

        // Записываем код алгоритма сжатия
        view.setUint8(SIGNATURE_SIZE + VERSION_SIZE, this.compressionCode);

        // Записываем код защиты от помех
        view.setUint8(SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE, this.errorProtectionCode);

        // Записываем длину файла
        view.setBigUint64(SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE + ERROR_PROTECTION_CODE_SIZE, BigInt(fileLength));

        // Записываем данные исходного файла
        for (let i = 0; i < fileLength; i++) {
            view.setUint8(
                SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE + ERROR_PROTECTION_CODE_SIZE + FILE_LENGTH_SIZE + i,
                rawData[i]
            );
        }

        return archiveBuffer;
    }

    decode(archiveBuffer) {
        const view = new DataView(archiveBuffer);

        // Читаем сигнатуру
        let signature = '';
        for (let i = 0; i < SIGNATURE_SIZE; i++) {
            signature += String.fromCharCode(view.getUint8(i));
        }

        // Проверяем сигнатуру
        if (signature !== this.signature) {
            throw new Error('Неверная сигнатура архива');
        }

        // Читаем версии формата
        const versionMajor = view.getUint8(SIGNATURE_SIZE);
        const versionMinor = view.getUint8(SIGNATURE_SIZE + 1);

        // Проверяем версию формата
        if (versionMajor !== this.versionMajor || versionMinor !== this.versionMinor) {
            throw new Error('Неверная версия архива');
        }

        // Читаем код сжатия и защиты от помех
        const compressionCode = view.getUint8(SIGNATURE_SIZE + VERSION_SIZE);
        const errorProtectionCode = view.getUint8(SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE);

        // Проверяем коды сжатия и защиты от помех
        if (compressionCode !== this.compressionCode || errorProtectionCode !== this.errorProtectionCode) {
            throw new Error('Неподдерживаемый алгоритм сжатия или защиты от помех');
        }

        // Читаем длину файла
        const fileLength = Number(view.getBigUint64(SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE + ERROR_PROTECTION_CODE_SIZE));

        // Читаем данные файла
        const rawData = new Uint8Array(fileLength);
        for (let i = 0; i < fileLength; i++) {
            rawData[i] = view.getUint8(
                SIGNATURE_SIZE + VERSION_SIZE + COMPRESSION_CODE_SIZE + ERROR_PROTECTION_CODE_SIZE + FILE_LENGTH_SIZE + i
            );
        }

        const decoder = new TextDecoder();
        return decoder.decode(rawData);
    }
}

// Основной скрипт
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("Использование: node script.js <encode|decode> <путь_к_файлу>");
    process.exit(1);
}

const command = args[0];
const filePath = args[1];
const signature = "ALEXEY";
const archive = new Archive(signature);

if (command === "encode") {
    try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const archiveBuffer = archive.encode(fileContent);

        const archivePath = filePath.replace(/\.txt$/, "") + ".otikAD";
        fs.writeFileSync(archivePath, Buffer.from(archiveBuffer));

        console.log(`Файл заархивирован в ${archivePath}`);
    } catch (error) {
        console.error("Ошибка при архивировании:", error.message);
    }
} else if (command === "decode") {
    try {
        const archiveBuffer = fs.readFileSync(filePath);
        const decodedData = archive.decode(archiveBuffer.buffer);

        const decodedFilePath = filePath.replace(/\.otikAD$/, ".decoded.txt");
        fs.writeFileSync(decodedFilePath, decodedData);

        console.log(`Файл восстановлен в ${decodedFilePath}`);
    } catch (error) {
        console.error("Ошибка при восстановлении:", error.message);
    }
} else {
    console.error("Неизвестная команда. Используйте 'encode' или 'decode'.");
}
