const fs = require("fs")

// Функция для расчёта частоты подстрок (двух символов)
function calculateSubstringFrequencies(content) {
    const substringFrequencies = {}
    const singleCharFrequencies = {}

    // Проход по строке для подсчёта пар символов
    for (let i = 0; i < content.length - 1; i++) {
        const a_j = content[i]
        const a_k = content[i + 1]

        const pair = `${a_j}${a_k}`

        // Подсчет двухсимвольных подстрок
        substringFrequencies[pair] = (substringFrequencies[pair] || 0) + 1

        // Подсчет символов, с которых начинаются подстроки
        singleCharFrequencies[a_j] = (singleCharFrequencies[a_j] || 0) + 1
    }

    // Последний символ не входит в пары, но его нужно учесть
    singleCharFrequencies[content[content.length - 1]] =
        (singleCharFrequencies[content[content.length - 1]] || 0) + 1

    return { substringFrequencies, singleCharFrequencies }
}

// Функция для расчёта условных вероятностей
function calculateConditionalProbabilities(
    substringFrequencies,
    singleCharFrequencies
) {
    const conditionalProbabilities = {}

    for (const pair in substringFrequencies) {
        const a_j = pair[0] // первый символ пары
        const a_k = pair[1] // второй символ пары

        const count_aj = singleCharFrequencies[a_j] || 0
        const count_aj_ak = substringFrequencies[pair] || 0

        // Условная вероятность p(a_k | a_j)
        conditionalProbabilities[pair] = count_aj_ak / count_aj
    }

    return conditionalProbabilities
}

// Функция для расчёта энтропии I_CM1
function calculateEntropy(conditionalProbabilities) {
    let entropy = 0

    for (const pair in conditionalProbabilities) {
        const prob = conditionalProbabilities[pair]

        if (prob > 0) {
            entropy += prob * Math.log2(prob)
        }
    }

    // Энтропия с отрицательным знаком, так как по формуле идет сумма с минусом
    return -entropy
}

// Чтение файла
const filePath = "../task3/files/1.txt"
const content = fs.readFileSync(filePath, "utf8")

// Подсчет частот
const { substringFrequencies, singleCharFrequencies } =
    calculateSubstringFrequencies(content)

// Вычисление условных вероятностей
const conditionalProbabilities = calculateConditionalProbabilities(
    substringFrequencies,
    singleCharFrequencies
)

// Подсчет энтропии
const entropy = calculateEntropy(conditionalProbabilities)

console.log("Энтропия I_CM1:", entropy, "бит")
