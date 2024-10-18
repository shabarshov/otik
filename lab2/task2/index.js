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
const fileContent = fs.readFileSync(filePath, "utf-8")

// Рассчитываем длину файла в символах Unicode
const fileLength = fileContent.length

// Считаем частоту вхождения каждого символа Unicode
const charFrequencies = {}
for (const char of fileContent) {
    charFrequencies[char] = (charFrequencies[char] || 0) + 1
}

// Рассчитываем вероятность и информацию для каждого символа
const charProbabilities = {}
const charInformation = {}
for (const [char, freq] of Object.entries(charFrequencies)) {
    const probability = freq / fileLength
    charProbabilities[char] = probability
    charInformation[char] = calculateInformation(probability)
}

// Сортируем таблицу характеристик символов по алфавиту и по убыванию частоты
const sortedCharProbabilities = Object.entries(charProbabilities).sort((a, b) =>
    a[0].localeCompare(b[0])
)
const sortedCharProbabilitiesByFreq = Object.entries(charProbabilities).sort(
    (a, b) => b[1] - a[1]
)

// Рассчитываем суммарное количество информации в файле
let totalInformation = 0
for (const [char, freq] of Object.entries(charFrequencies)) {
    totalInformation += freq * charInformation[char]
}

// Выводим результаты
console.log(`Длина файла в символах Unicode: ${fileLength}`)
console.log("Таблица характеристик символов по алфавиту:")
for (const [char, prob] of sortedCharProbabilities) {
    console.log(
        `Символ: <- ${char} ->, Вероятность: ${prob.toFixed(
            6
        )}, Информация: ${charInformation[char].toFixed(6)}`
    )
}

console.log("\nТаблица характеристик символов по убыванию частоты:")
for (const [char, prob] of sortedCharProbabilitiesByFreq) {
    console.log(
        `Символ: <- ${char} ->, Вероятность: ${prob.toFixed(
            6
        )}, Информация: ${charInformation[char].toFixed(6)}`
    )
}

console.log(
    `\nСуммарное количество информации в файле: ${totalInformation.toFixed(
        6
    )} бит`
)
console.log(
    `Суммарное количество информации в файле: ${(totalInformation / 8).toFixed(
        6
    )} байт`
)
