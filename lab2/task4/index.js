const fs = require("fs")
const path = require("path")

// Function to calculate count(aj ak) and count(aj *)
function calculateCounts(data) {
    const counts = {} // For count(aj ak)
    const singleCounts = {} // For count(aj *)

    // Loop through the file content
    for (let i = 0; i < data.length - 1; i++) {
        const aj = data[i]
        const ak = data[i + 1]

        // Update counts for aj ak (pair of consecutive characters)
        const pair = aj + ak
        counts[pair] = (counts[pair] || 0) + 1

        // Update singleCounts for aj
        singleCounts[aj] = (singleCounts[aj] || 0) + 1
    }

    // Handle the last symbol in singleCounts
    const lastSymbol = data[data.length - 1]
    singleCounts[lastSymbol] = (singleCounts[lastSymbol] || 0) + 1

    return { counts, singleCounts }
}

// Function to calculate conditional probabilities
function calculateProbabilities(counts, singleCounts) {
    const probabilities = {}

    // Calculate the conditional probability P(ak | aj) for each pair
    for (const pair in counts) {
        const aj = pair[0] // First character of the pair
        probabilities[pair] = counts[pair] / singleCounts[aj]
    }

    return probabilities
}

// Updated function to calculate I_CM1(Q)
function calculateInformation(probabilities, counts, singleCounts, dataLength) {
    let totalInformation = 0
    const uniformProbability = 1 / 256

    for (const symbol in singleCounts) {
        const symbolProbability = singleCounts[symbol] / dataLength
        totalInformation += -symbolProbability * Math.log2(uniformProbability)
    }

    for (const pair in probabilities) {
        const probability = probabilities[pair]
        totalInformation += counts[pair] * -Math.log2(probability)
    }

    return {
        bits: totalInformation,
        bytes: totalInformation / 8,
    }
}

// Main function
function main(filePath) {
    // Read file
    let data = fs.readFileSync(filePath, "utf-8")

    // Remove newlines and whitespace
    data = data.replace(/\s+/g, "")
    console.log("File content:", data)

    // Calculate counts
    const { counts, singleCounts } = calculateCounts(data)

    // Calculate probabilities
    const probabilities = calculateProbabilities(counts, singleCounts)

    // Calculate information
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

// Run the program for all files
const files = [
    "../files/a.txt",
    "../files/aabacad.txt",
    "../files/ab.txt",
    "../files/abab.txt",
    "../files/abcd.txt",
    "../files/abac.txt",
]

files.forEach((file) => {
    const filePath = path.resolve(__dirname, file)
    main(filePath)
})
