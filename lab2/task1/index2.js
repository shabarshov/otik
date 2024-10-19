const fs = require("fs")
const path = require("path")

// Функция для расчета информации в символе
function calculateInformation(probability) {
    if (probability === 0) {
        return 0
    }
    return -Math.log2(probability)
}

// Открываем файл для анализа (замените "file.txt" на имя вашего файла)
const filePath = path.resolve(__dirname, "file.txt")
const fileContent = fs.readFileSync(filePath)

// Рассчитываем длину файла в байтах
const fileLength = fileContent.length

// Считаем частоту вхождения каждого байта
const byteFrequencies = {}
for (const byte of fileContent) {
    byteFrequencies[byte] = (byteFrequencies[byte] || 0) + 1
}

// Рассчитываем вероятность и информацию для каждого байта
const byteProbabilities = {}
const byteInformation = {}
for (const [byte, freq] of Object.entries(byteFrequencies)) {
    const probability = freq / fileLength
    byteProbabilities[byte] = probability
    byteInformation[byte] = calculateInformation(probability)
}

// Сортируем таблицу характеристик символов по алфавиту и по убыванию частоты
const sortedByteProbabilities = Object.entries(byteProbabilities).sort(
    (a, b) => a[0] - b[0]
)
const sortedByteProbabilitiesByFreq = Object.entries(byteProbabilities).sort(
    (a, b) => b[1] - a[1]
)

// Функция для преобразования байта в шестнадцатеричное представление
function toHex(byte) {
    return `0x${(byte & 0xff).toString(16).padStart(2, "0")}`
}

// Рассчитываем суммарное количество информации в файле
let totalInformation = 0
for (const [byte, freq] of Object.entries(byteFrequencies)) {
    totalInformation += freq * byteInformation[byte]
}

// Оценка в битах и октетах для сжатия
const informationInBits = totalInformation.toFixed(2)
const informationInOctets = (totalInformation / 8).toFixed(2)
const LQ_bits = (fileLength * 8).toFixed(2)
const LQ_octets = fileLength.toFixed(2)

// Длина сжатого текста (оценка E)
const E_octets = Math.ceil(informationInOctets)

// Оценки для таблиц частот G64 и G8
const G64_octets = E_octets + 256 * 8
const G8_octets = E_octets + 256 * 1

// Выводим результаты
console.log(`Длина файла в байтах: ${fileLength}`)
console.log(`Длина файла в битах: ${fileLength * 8}`)
console.log("Таблица характеристик символов по алфавиту:")
for (const [byte, prob] of sortedByteProbabilities) {
    console.log(
        `Символ: ${toHex(byte)}, Вхождений: ${
            byteFrequencies[byte]
        }, Вероятность: ${prob.toFixed(6)}, Информация: ${byteInformation[byte].toFixed(6)}`
    )
}

console.log("\nТаблица характеристик символов по убыванию частоты:")
for (const [byte, prob] of sortedByteProbabilitiesByFreq) {
    console.log(
        `Символ: ${toHex(byte)}, Вхождений: ${
            byteFrequencies[byte]
        }, Вероятность: ${prob.toFixed(6)}, Информация: ${byteInformation[byte].toFixed(6)}`
    )
}

console.log(
    `\nСуммарное количество информации в файле: ${totalInformation.toFixed(2)} бит`
)
console.log(`Суммарное количество информации в байтах: ${informationInOctets} байт`)
console.log(`Оценка E (сжатый текст): ${E_octets} октетов`)
console.log(`Оценка G64 (с таблицей ненормированных частот): ${G64_octets} октетов`)
console.log(`Оценка G8 (с таблицей нормированных частот): ${G8_octets} октетов`)
