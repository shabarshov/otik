const fs = require("fs")
const path = require("path")
const chardet = require("chardet")

// Функция для расчета частоты октетов
function calculateOctetFrequencies(filePath) {
    const octetFrequencies = {}

    const content = fs.readFileSync(filePath)
    for (const byte of content) {
        octetFrequencies[byte] = (octetFrequencies[byte] || 0) + 1
    }

    return octetFrequencies
}

// Функция для вывода топ N октетов
function printTopOctets(octetFrequencies, n) {
    console.log(`Топ ${n} октетов:`)
    const sortedOctets = Object.entries(octetFrequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)

    for (const [octet, freq] of sortedOctets) {
        console.log(
            `Октет: 0x${parseInt(octet)
                .toString(16)
                .toUpperCase()
                .padStart(2, "0")}, Частота: ${freq}`
        )
    }
}

// Папка с файлами plaintext
const plaintextFolder = path.resolve(__dirname, "files/plaintext")

// Перебираем файлы в папке
fs.readdirSync(plaintextFolder).forEach((filename) => {
    const filePath = path.join(plaintextFolder, filename)

    if (fs.lstatSync(filePath).isFile()) {
        const octetFrequencies = calculateOctetFrequencies(filePath)
        console.log(`\nАнализ файла: ${filename}`)
        printTopOctets(octetFrequencies, 4)
    }
})

// Путь к файлу Z (замените на соответствующий путь)
const fileZPath = path.resolve(__dirname, "files/2.txt")
if (fs.existsSync(fileZPath)) {
    // Определяем кодировку файла Z
    const data = fs.readFileSync(fileZPath)
    const encoding = chardet.detect(data)

    try {
        const decodedText = data.toString(encoding)
        console.log(
            `Файл Z является русскоязычным текстом в кодировке ${encoding}`
        )
    } catch (error) {
        console.log(
            "Файл Z не является русскоязычным текстом в стандартных кодировках"
        )
    }
}
