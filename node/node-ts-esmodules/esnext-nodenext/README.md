В данном примере мы исправили ошибку выше, изменив в tsconfig.json `"moduleResolution": "Node"` на `"moduleResolution": "NodeNext"`. Таким образом мы указали транспилятору
TypeScript, что для разрешения путей к файлам нужно использовать [подход ECMAScript модулей для node.js](https://nodejs.org/docs/latest-v20.x/api/esm.html#import-specifiers)

Собираем пример и видим, что никаких ошибок при транспиляции нет
```bash
npm run build
```

При запуске на node версии от 14 и выше, так же не видим никаких ошибок.
```bash
node build/index.js
```

Теперь раскомментируем строки в файле index.js и снова соберем пример, ошибок нет
```bash
npm run build
```
Снова запустим получившийся после транспиляции код и получим ошибку 
```bash
file:///Users/msermakov/practicum/node/node-ts-esmodules/esnext-nodenext/build/index.js:4
const object = lodash.clone({ a: { b: { c: 1 } } });
               ^

ReferenceError: lodash is not defined
    at file:///Users/msermakov/practicum/node/node-ts-esmodules/esnext-nodenext/build/index.js:4:16
    at ModuleJob.run (node:internal/modules/esm/module_job:217:25)
    at async ModuleLoader.import (node:internal/modules/esm/loader:316:24)
    at async loadESM (node:internal/process/esm_loader:34:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)

Node.js v20.8.0
``` 
В данном примере в качестве зависимости мы используем библиотеку `lodash`, она распространяется в виде commonjs модуля. В файле `src/index.ts` мы импортируем ее такой конструкцией
`import lodash = require('lodash');`. Теперь обратим внимание на файл `build/index.js`, получившийся в результате транспиляции, в нем есть использование библиотеки lodash, но отсуствует ее импортирование.
Это и является причиной ошибки выше. 
Отсутствие импортирования библиотеки lodash в `build/index.js` связано с двумя моментами. Во-первых, `lodash` в файле src/index.ts импортурется как commonjs модуль, поэтому само импортирование
осуществляется при помощи ключевого слова `require`. Во-вторых, в tsconfig в поле `module` у нас стоит значение `ESNext`. В совокупности эти два момента дают следующий эффект:
так как мы явно указали транспирятору, что в результате мы хотим получить код в виде ECMAScript модулей, то в этом случае транспилятор проигнорирует любые импорты с ключевым словом `require`, как итог в
`build/index.js` нет импорта библиотеки lodash. Такое поведение обуславливается тем, что `"module": "ESNext"` не подразумевает какое-либо использование commonjs модулей.
