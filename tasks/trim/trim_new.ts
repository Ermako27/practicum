
/** 
Напишите функцию, которая умеет удалять заданные символы из начала и конца строки. Удаляемые символы задаются в массиве, идущим вторым аргументом функции.
Если массив с удаляемыми символами не передан, то из начала и конца строки должны быть удалены только пробелы.

trim('  abc  '); // => 'abc'
trim('-_-abc-_-', ['_', '-']); // => 'abc'
trim('\xA0foo'); // => 'foo'
trim('\xA0foo', [' ']); // => ' foo'
trim('-_-ab c -_-', ['_', '-']); // => 'ab c '
*/

function trim(string: string, charsArr?: string[]): string {
    // по умолчанию будем удалять все пробелы
    let charsToDelete = [' ', '\xA0']

    if (charsArr) {
        charsToDelete = charsArr
    }


    const splitedString = string.split('');

    // удаляем символы из начала строки
    while(charsToDelete.includes(splitedString[0])) {
        splitedString.shift();
    }

    // удаляем символы из конца строки
    while(charsToDelete.includes(splitedString[splitedString.length - 1])) {
        splitedString.pop();
    }


    return splitedString.join('');
}

trim('  abc  '); // => 'abc'
trim('-_-abc-_-', ['_', '-']); // => 'abc'
trim('\xA0foo'); // => 'foo'
trim('\xA0foo', [' ']); // => ' foo'
trim('-_-ab c -_-', ['_', '-']); // => 'ab c '