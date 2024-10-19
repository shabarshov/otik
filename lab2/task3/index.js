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
function printTopOctets(octetFrequencies, n, filterNonAscii = false) {
    const filteredOctets = filterNonAscii
        ? Object.entries(octetFrequencies).filter(
              ([octet]) => octet < 32 || (octet > 126 && octet <= 255)
          ) // отфильтровать не ASCII коды
        : Object.entries(octetFrequencies)

    const sortedOctets = filteredOctets.sort((a, b) => b[1] - a[1]).slice(0, n)

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
const plaintextFolder = path.resolve(__dirname, "files2")

// Перебираем файлы в папке
fs.readdirSync(plaintextFolder).forEach((filename) => {
    const filePath = path.join(plaintextFolder, filename)

    if (fs.lstatSync(filePath).isFile()) {
        const octetFrequencies = calculateOctetFrequencies(filePath)
        console.log(`\nАнализ файла: ${filename}`)

        // Вывод топ 4 всех октетов
        console.log("Топ 4 октетов (все):")
        printTopOctets(octetFrequencies, 4)

        // Вывод топ 4 октетов, которые не являются печатными ASCII
        console.log("Топ 4 октетов (не ASCII):")
        printTopOctets(octetFrequencies, 4, true)
    }
})

// Путь к файлу W (замените на соответствующий путь)
const fileWPath = path.resolve(__dirname, "files/5.txt")
if (fs.existsSync(fileWPath)) {
    // Определяем кодировку файла W
    const data = fs.readFileSync(fileWPath)
    const encoding = chardet.detect(data)

    try {
        console.log(
            `\nФайл W является русскоязычным текстом в кодировке ${encoding}`
        )
    } catch (error) {
        console.log(
            "\nФайл W не является русскоязычным текстом в стандартных кодировках"
        )
    }
}
