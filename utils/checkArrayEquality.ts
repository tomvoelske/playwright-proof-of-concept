/**
 * Checks if two arrays of strings have the same contents, regardless of order.
 * 
 * @param {string[]} firstArray - The first array of strings.
 * @param {string[]} secondArray - The second array of strings.
 * @returns {Promise<boolean>} - Returns true if the arrays have the same contents, false otherwise.
 */
export async function checkArrayEquality(firstArray: string[], secondArray: string[]): Promise<boolean> {

    if (firstArray.length !== secondArray.length) {
        return false;
    }

    // using .slice() to compare copies of the arrays so as not to mutate the original

    const sortedFirstArray = firstArray.slice().sort();
    const sortedSecondArray = secondArray.slice().sort();

    for (let i = 0; i < sortedFirstArray.length; i++) {
        if (sortedFirstArray[i] !== sortedSecondArray[i]) {
            return false;
        }
    }

    return true;

}