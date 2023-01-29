'use strict';


/**
 * Складывает два целых числа
 * @param {Number} a Первое целое
 * @param {Number} b Второе целое
 * @throws {TypeError} Когда в аргументы переданы не числа
 * @returns {Number} Сумма аргументов
 */
function abProblem(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
        throw new TypeError("type")
    }
    return a + b;
}

/**
 * Определяет век по году
 * @param {Number} year Год, целое положительное число
 * @throws {TypeError} Когда в качестве года передано не число
 * @throws {RangeError} Когда год – отрицательное значение
 * @returns {Number} Век, полученный из года
 */
function centuryByYearProblem(year) {
    if (typeof year !== "number") {
        throw new TypeError("type")
    }
    if (!Number.isInteger(year) || year < 0) {
        throw new RangeError("Invalid params")
    }
    return Math.ceil(year / 100);
}
var num = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "A": 10,
    "B": 11,
    "C": 12,
    "D": 13,
    "E": 14,
    "F": 15,
    "a": 10,
    "b": 11,
    "c": 12,
    "d": 13,
    "e": 14,
    "f": 15
}


function get(ch) {
    const regex2 = new RegExp('^([0-9]|[A-F]|[a-f])$');
    if (!regex2.test(ch)) {
        throw new RangeError("invalid params");
    }
    return num[ch];
}


/**
 * Переводит цвет из формата HEX в формат RGB
 * @param {String} hexColor Цвет в формате HEX, например, '#FFFFFF'
 * @throws {TypeError} Когда цвет передан не строкой
 * @throws {RangeError} Когда значения цвета выходят за пределы допустимых
 * @returns {String} Цвет в формате RGB, например, '(255, 255, 255)'
 */
function colorsProblem(hexColor) {
    if (typeof hexColor !== "string" || hexColor.length === 0 || hexColor[0] !== '#') {
        throw new TypeError("type")
    }
    if (hexColor.length !== 7) {
        throw new RangeError("wrong length")
    }
    let r = get(hexColor[1]) * 16 + get(hexColor[2]);
    let g = get(hexColor[3]) * 16 + get(hexColor[4]);
    let b = get(hexColor[5]) * 16 + get(hexColor[6]);
    if (r > 255 || g > 255 || b > 255) {
        throw new RangeError("wrong range")
    }

    return '(' + r + ', ' + g + ', ' + b + ')';
}


/**
 * Находит n-ое число Фибоначчи
 * @param {Number} n Положение числа в ряде Фибоначчи
 * @throws {TypeError} Когда в качестве положения в ряде передано не число
 * @throws {RangeError} Когда положение в ряде не является целым положительным числом
 * @returns {Number} Число Фибоначчи, находящееся на n-ой позиции
 */
function fibonacciProblem(n) {
    if (typeof n !== "number") {
        throw new TypeError("type")
    }
    if (!Number.isInteger(n) || n <= 0) {
        throw new RangeError("invalid param")
    }
    let a = 0;
    let b = 1;
    for (let i = 0; i < n; i++) {
        let t = b
        b = a + b;
        a = t;
    }
    return a;
}

/**
 * Транспонирует матрицу
 * @param {(Any[])[]} matrix Матрица размерности MxN
 * @throws {TypeError} Когда в функцию передаётся не двумерный массив
 * @returns {(Any[])[]} Транспонированная матрица размера NxM
 */
function matrixProblem(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0 || !matrix.every(Array.isArray)) {
        throw new TypeError('type');
    }
    let ans = new Array(matrix[0].length);            // создаем пустой массив длины `M`
    for (let i = 0; i < matrix[0].length; i++) {
        ans[i] = new Array(matrix.length);        // делаем каждый элемент массивом
    }
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            ans[j][i] = matrix[i][j];
        }
    }
    return ans;
}

/**
 * Переводит число в другую систему счисления
 * @param {Number} n Число для перевода в другую систему счисления
 * @param {Number} targetNs Система счисления, в которую нужно перевести (Число от 2 до 36)
 * @throws {TypeError} Когда переданы аргументы некорректного типа
 * @throws {RangeError} Когда система счисления выходит за пределы значений [2, 36]
 * @returns {String} Число n в системе счисления targetNs
 */
function numberSystemProblem(n, targetNs) {
    if (typeof n !== "number" || typeof targetNs !== "number") {
        throw new TypeError("type");
    }
    if (!(targetNs >= 2 && targetNs <= 36)) {
        throw new RangeError("invalid")
    }
    return n.toString(targetNs);
}


/**
 * Проверяет соответствие телефонного номера формату
 * @param {String} phoneNumber Номер телефона в формате '8–800–xxx–xx–xx'
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Boolean} Если соответствует формату, то true, а иначе false
 */
function phoneProblem(phoneNumber) {
    if (typeof phoneNumber !== "string") {
        throw new TypeError("type")
    }
    const regex2 = new RegExp('^8-800-[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$');
    return regex2.test(phoneNumber);
}



/**
 * Определяет количество улыбающихся смайликов в строке
 * @param {String} text Строка в которой производится поиск
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Number} Количество улыбающихся смайликов в строке
 */
function smilesProblem(text) {
    if (typeof text !== "string") {
        throw new TypeError("type")
    }
    let ans = 0;
    for (let i = 0; i < text.length - 2; i++) {
        if (text[i] === '(' && text[i + 1] === '-' && text[i + 2] === ':')
            ans++;
        if (text[i] === ':' && text[i + 1] === '-' && text[i + 2] === ')')
            ans++;
    }
    return ans;
}

/**
 * Определяет победителя в игре "Крестики-нолики"
 * Тестами гарантируются корректные аргументы.
 * @param {(('x' | 'o')[])[]} field Игровое поле 3x3 завершённой игры
 * @returns {'x' | 'o' | 'draw'} Результат игры
 */
function ticTacToeProblem(field) {

    for (let i = 0; i < 3; i++) {
        let ch = field[i][0];
        if (field[i][1] === ch && field[i][2] === ch) {
            return ch;
        }
        ch = field[0][i];
        if (field[1][i] === ch && field[2][i] === ch) {
            return ch;
        }
    }
    let ch = field[0][0];
    if (field[1][1] === ch && field[2][2] === ch) {
        return ch;
    }
    ch = field[0][2];
    if (field[1][1] === ch && field[2][0] === ch) {
        return ch;
    }
    return "draw";
}

module.exports = {
    abProblem,
    centuryByYearProblem,
    colorsProblem,
    fibonacciProblem,
    matrixProblem,
    numberSystemProblem,
    phoneProblem,
    smilesProblem,
    ticTacToeProblem
};
