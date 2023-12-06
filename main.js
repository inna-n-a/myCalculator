// состояние калькулятора
let calculatorState = 'ok';
// переменная для хранения значения в памяти (MR)
let memoryStoredValue = 0;
// первый  операнд
let firstOperand = '';
// текущий оператор
let currentOperator = '';
// состояние ожидания ввода операнда
let operandExpected = false
// состояние операнд введён
let operandInputed = false;

// получаем массив кнопок
let buttons = Array.from(document.getElementsByTagName('button'));
// для каждой кнопки запускаем функцию обработки нажатия кнопки 
buttons.forEach(btn => btn.addEventListener('click', e => processButton(e.target.id)));

// функция проверки нажатия числовой кнопки
function isNumber(value) {
    return value.length == 1 && value >= '0' && value <= '9';
}

// главная функция — обработка нажатия кнопки
function processButton(value) {
    if (calculatorState == "err") { // если состояние калькулятора — ошибка 
        if (isNumber(value)) { // если введено число
            clear(); // выполняем функцию сброса всех данных
        } else if (value != "ca") { // блокируем все операции кроме операции полной очистки
            return;
        }
    }

    // объявляем элемент поля ввода-вывода
    let box = document.getElementById('box');
    let boxValue = box.innerText;

    if (isNumber(value)) { // если введено число
        // убираем лишний ноль перед числом или цифрой при наличии 
        if (boxValue == '0' || boxValue == '-0') {
            boxValue = boxValue.slice(0, -1);
        }

        // проверка на ввод операнда
        // значение true ожидается:
        // 1. после введения операции, когда ожидается ввод следующего операнда
        // 2. после нажатия на кнопку "="
        // 3. ввод первого операнда для операции
        if (operandExpected) {
            boxValue = ''; // очищаем бокс, так как ожидаем ввод следующего операнда
            operandExpected = false;
            operandInputed = true;
        }
        // записываем цифру в бокс
        boxValue += value;
    }

    if (['+', '-', '*', '/'].includes(value)) { // если введена арифметическая операция
        if (firstOperand != '' && operandInputed) { // если есть два операнда
            const operand = cleanNumberStr(boxValue);
            // в бокс записываем результат вычисления и запоминаем состояние калькулятора
            [boxValue, calculatorState] = calculate(firstOperand, operand, currentOperator);
            // меняем состояние операнда
            operandInputed = false;
        }

        // записываем значение из бокса в первый операнд
        firstOperand = cleanNumberStr(boxValue);
        // ожидаем ввод следующего операнда
        operandExpected = true;
        // запоминаем текущую операцию
        currentOperator = value;
    }

    // переменная для вычислений
    let operand = '';

    //основнеой выбор действий

    switch (value) {
        case '=':
            // проверка  наличия всех данных
            if (operandExpected || firstOperand == '' || currentOperator == '') {
                return;
            }
            // создаем операнд для последнего введённого значения
            let secondOperand = cleanNumberStr(boxValue);
            // вычисляем
            [boxValue, calculatorState] = calculate(firstOperand, secondOperand, currentOperator);
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            // обнуляем операнды
            firstOperand = '';
            currentOperator = '';
            break;

        case '.':
            // проверяем, есть ли уже точки в боксе
            if (boxValue.indexOf('.') >= 0) {
                // если точки уже есть, выходим
                return;
            }
            // добавляем точку
            boxValue += value;
            break;

        case 'changeSign':
            if (boxValue.startsWith('-')) {
                boxValue = boxValue.slice(1);
            } else {
                boxValue = '-' + boxValue;
            }
            break;

        case 'sqrt': // квадратный корень
            operand = cleanNumberStr(boxValue);
            // если введено отрицательное число, меняем состояние калькулятора на ошибку
            if (operand.startsWith('-')) {
                calculatorState = 'err';
            } else {
                boxValue = Math.sqrt(parseFloat(operand)).toString();
            }
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            break;

        case '1divx': // делим единицу на число
            operand = cleanNumberStr(boxValue);
            if (operand == '0') {
                calculatorState = 'err';
            } else {
                boxValue = (1.0 / parseFloat(operand)).toString();
            }
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            break;

        case 'pow': // возведение в квадрат
            operand = cleanNumberStr(boxValue);
            boxValue = Math.pow(parseFloat(operand), 2).toString();
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            break;

        case '%':
            operand = cleanNumberStr(boxValue);
            boxValue = (parseFloat(operand) / 100.0).toString();
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            break;

        case 'mr':
            // записываем в бокс значение из памяти
            boxValue = memoryStoredValue.toString();
            //
            if (operandExpected) {
                operandInputed = true;
                operandExpected = false;
            }
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            break;

        case 'm+':
            operand = parseFloat(cleanNumberStr(boxValue));
            memoryStoredValue += operand;
             // меняем состояния операндов
             operandInputed = false;
             operandExpected = true;
            break;

        case 'm-':
            operand = parseFloat(cleanNumberStr(boxValue));
            memoryStoredValue -= operand;
            // меняем состояния операндов
            operandInputed = false;
            operandExpected = true;
            break;

        case 'mc':
            // обнуляем память
            memoryStoredValue = 0;
            break;

        case 'remove':
            // удаляем последний элемент числа из бокса
            let removed = boxValue.slice(0, -1);
            //если в боксе осталось число, отображаем его, 
            //если нет, в бокс записываем 0
            boxValue = removed.length > 0 ? removed : '0';
            break;

        case 'ce':
            boxValue = '0';
            break;

        case 'ca':
            clear();
            return;
    }

    // проверка на состояние ошибки
    if (calculatorState == 'err') {
        boxValue = 'ERROR';
    }
    // выводим в бокс результат
    box.innerText = boxValue;
}

// функция удаления лишних нулей
function cleanNumberStr(numStr) {
    if (numStr == '0' || numStr == '-0' || numStr == '0.') {
        return '0';
    }
    return numStr; // возвращаем очищенную от лишних нулей строку
}

// функция для выполнения арифметических операций
// возвращает результат операции и состояние калькулятора
function calculate(firstOperand, secondOperand, operator) {
    const num1 = parseFloat(firstOperand);
    const num2 = parseFloat(secondOperand);
    let total = 0;

    switch (operator) {
        case '+':
            total = num1 + num2;
            break;

        case '-':
            total = num1 - num2;
            break;

        case '*':
            total = num1 * num2;
            break;

        case '/':
            if (num2 == 0) {
                return ['', 'err'] // при делении на ноль состояние ошибки
            }
            total = num1 / num2;
            break;
    }

    // возвращает результат и состояние ок во всех случаях, кроме деления на ноль
    return [total.toString(), 'ok']
}

// функция очистки поля ввода / вывода
function clear() {
    calculatorState = 'ok';
    firstOperand = '';
    currentOperator = '';
    document.getElementById('box').innerText = '0';
    operandInputed = false;
    operandExpected = false;
}

