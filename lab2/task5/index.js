const fs = require("fs")
const path = require("path")

// Функция для подсчета count(aj ak) и count(aj *)
function calculateCounts(data) {
    const counts = {} // Для count(aj ak)
    const singleCounts = {} // Для count(aj *)

    // Перебор всех символов в строке
    for (let i = 0; i < data.length - 1; i++) {
        const aj = data.charAt(i) // Получаем символ Unicode
        const ak = data.charAt(i + 1) // Следующий символ Unicode

        // Обновляем count для aj ak (пара последовательных символов)
        const pair = aj + ak
        counts[pair] = (counts[pair] || 0) + 1

        // Обновляем count для aj (одиночные символы)
        singleCounts[aj] = (singleCounts[aj] || 0) + 1
    }

    // Обрабатываем последний символ
    const lastSymbol = data.charAt(data.length - 1)
    singleCounts[lastSymbol] = (singleCounts[lastSymbol] || 0) + 1

    return { counts, singleCounts }
}

// Функция для подсчета условных вероятностей
function calculateProbabilities(counts, singleCounts) {
    const probabilities = {}

    // Вычисляем условную вероятность P(ak | aj) для каждой пары
    for (const pair in counts) {
        const aj = pair[0] // Первый символ пары
        probabilities[pair] = counts[pair] / singleCounts[aj]
    }

    return probabilities
}

// Обновленная функция для вычисления I_CM1(Q)
function calculateInformation(probabilities, counts, singleCounts, dataLength) {
    let totalInformation = 0
    const uniformProbability = 1 / 256

    // Рассчитываем информацию для одиночных символов
    for (const symbol in singleCounts) {
        const symbolProbability = singleCounts[symbol] / dataLength
        totalInformation += -symbolProbability * Math.log2(uniformProbability)
    }

    // Рассчитываем информацию для пар символов
    for (const pair in probabilities) {
        const probability = probabilities[pair]
        totalInformation += counts[pair] * -Math.log2(probability)
    }

    return {
        bits: totalInformation,
        bytes: totalInformation / 8,
    }
}

// Основная функция
function main(filePath) {
    // Чтение файла
    let data = fs.readFileSync(filePath, "utf-8")

    // Убираем пробелы и новые строки
    data = data.replace(/\s+/g, "")
    console.log("File content:", data)

    // Подсчитываем количество
    const { counts, singleCounts } = calculateCounts(data)

    // Подсчитываем вероятности
    const probabilities = calculateProbabilities(counts, singleCounts)

    // Подсчитываем информацию
    const information = calculateInformation(
        probabilities,
        counts,
        singleCounts,
        data.length
    )

    console.log("File:", path.basename(filePath))
    console.log("Counts (aj ak):", counts)
    console.log("Counts (aj *):", singleCounts)
    console.log("Probabilities:", probabilities)
    console.log("Information (I_CM1) in bits:", information.bits)
    console.log("Information (I_CM1) in bytes:", information.bytes)
    console.log("-------------------------")
}

// Запуск программы для всех файлов
const files = [
    "../files/a.txt",
    "../files/aabacad.txt",
    "../files/ab.txt",
    "../files/abab.txt",
    "../files/abcd.txt",
    "../files/abac.txt",
    "../files/task5_unicode.txt",
]

files.forEach((file) => {
    const filePath = path.resolve(__dirname, file)
    main(filePath)
})
