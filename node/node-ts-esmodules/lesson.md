В сегодняшнем уроке мы расскажем и покажем как все настроить для того, чтобы писать код для node.js приложения на TypeScript с использованием ECMAScript модулей.
Рассмотрим новые значения параметров в tsconfig.json и на примерах увидим как они влияют на итоговый код. Так же познакомимся с новыми расширениями файлов,
которые позволяет использовать TypeScript.


## Параметры tsconfig.json
В самом начале стоит сказать, что Node.js, начиная с 12 версии, может в рамках одного приложения одновременно работать как CommonJs, так и с ECMAScript модулями. Например, сам код приложения и используемые им
зависимости могут иметь разные системы модулей.

Далее вспомним, что TypeScript сам по себе не запускается ни в node.js ни даже в браузере, так как он является просто типизированной надстройкой над JavaScript.
TypeScript транспилируется в JavaScript при помощи инструмента под названием tsc. То какой именно код мы получим в результате транспиляции мы можем настраивать в файле
tsconfig.json, при выборе настроек необходимо исходить из того где именно, в какой среде будет запускаться полученный код, в нашем случае эта среда - node.js с поддержкой ECMAScript модулей.

Для корректной работы транспилированного кода в нужной нам среде разработчики TypeScript для параметров `module` и `moduleResolution` добавили новые значения `Node16` и `NodeNext`. 
Эти новые значения как раз и говорят транспилятору TypeScript генерировать код, в котором могут одновременно использоваться CommonJs и ECMAScript модули.
Каждое из значений можно поставить в каждый из двух параметров. Для справки сразу дадим ссылок, чтобы разобраться что такое `module` и `moduleResolution`.
Для `module`
1. [что такое module](https://www.typescriptlang.org/docs/handbook/modules.html)
2. [какие значения он может принимать](https://www.typescriptlang.org/tsconfig#module)
Для `moduleResolution`
1. [что такое moduleResolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html#node)
2. [какие значения он может принимать](https://www.typescriptlang.org/tsconfig#moduleResolution)

Если коротко `module` определяет для какой модульной системы будет сгенерирован код, `moduleResolution` определяет с помощью каких правил транспилятор будет производить поиск файла в файловой системе. 
Дальше мы рассмотрим три маленьких проекта, на их примере мы увидим как будет работать сборка и запуск кода, транспиляция которого проходила с разными значениями параметров `module` и `moduleResolution`,
поймем почему нужно использовать именно `Node16` или `NodeNext`. В каждом из примеров поле `type` в package.json имеет значение `module`. 

## Примеры

### Пример 1
В первом примере tsconfig.json имеет вид
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./build",
    "target": "es2021",
    "lib": ["es2021"],

    "module": "ESNext",
    "moduleResolution": "Node"
  },
  "include": ["./src/**/*"]
}
```
Собираем пример и видим, что никаких ошибок при транспиляции нет
```bash
npm run build
```

Но в результате запуска на node версии от 14 и выше имеем ошибку

```bash
node build/index.js
```

```bash
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/msermakov/practicum/node/node-ts-esmodules/esnext-node/build/summator' imported from /Users/msermakov/practicum/node/node-ts-esmodules/esnext-node/build/index.js
    at new NodeError (internal/errors.js:322:7)
    at finalizeResolution (internal/modules/esm/resolve.js:318:11)
    at moduleResolve (internal/modules/esm/resolve.js:776:10)
    at Loader.defaultResolve [as _resolve] (internal/modules/esm/resolve.js:887:11)
    at Loader.resolve (internal/modules/esm/loader.js:89:40)
    at Loader.getModuleJob (internal/modules/esm/loader.js:242:28)
    at ModuleWrap.<anonymous> (internal/modules/esm/module_job.js:76:40)
    at link (internal/modules/esm/module_job.js:75:36) {
  code: 'ERR_MODULE_NOT_FOUND'
}
```

Ошибка в том, что в импорте `import { summator } from "./summator";` у файла не указано расширение `.js`. В чем причина этой ошибки? Чтобы в этом разобраться стоит лишний раз упомянуть, что node.js поддерживает
две системы модулей: commonjs и ECMAScript модули. Каждая из них по-разному находит файлы модулей в файловой системе и по разному их загружает, разница между ними по пунктам описана в https://nodejs.org/docs/latest-v20.x/api/packages.html#modules-loaders
Нас в контексте примера интересуют следующие пункты, которые показывают как каждая система модулей разрешает путь к файлу.
Для commonjs:
When resolving a specifier, if no exact match is found, it will try to add extensions (.js, .json, and finally .node) and then attempt to resolve [folders as modules](https://nodejs.org/docs/latest-v20.x/api/modules.html#folders-as-modules).
Для ECMAScript модулей:
It does not support folders as modules, directory indexes (e.g. './startup/index.js') must be fully specified.

Поясним каждый из пунктов. При использовании commonjs, то node.js разрешает путь к файлу так:
* сначала node.js пытается найти файл по пути, указанному в `require('...')`, если файл найти не удается, то переходит к следующим шагам.
* использует подход [файл как модуль](https://nodejs.org/docs/latest-v20.x/api/modules.html#folders-as-modules)
* пытается сам добавить к пути в `require('...')` расширения .js, .json и .node. Например, в коде есть `require('./foo')`, node.js, не найдя расширения, сам подставит его и попытается найти файл `require('./foo.js')`
  В то же время, при использовании ECMAScript модулей, если в `import { summator } from "./summator";` нет расширения, то node.js выведет явную ошибку, так как он требует полного пути к конкретному файлу с кодом с указанием расширения, то есть корректный импорт выглядит так `import { summator } from "./summator.js";`. Подробнее о том, как node.js разрешает пути к файлам при использовании ECMAScript модулей
  можно прочитать в [документации](https://nodejs.org/docs/latest-v20.x/api/esm.html#import-specifiers). Как мы видим, способы разрешения пути к файлу с кодом различаются.

В `tsconfig.json` в параметре `moduleResolution` указано значение `Node`. Этим мы говорим транспилятору TypeScript руководствоваться правилами для commonjs модулей при разрешении путей к файлам в процессе транспиляции. Выше мы упоминали эти правила
с использованием ключевого слова `require('...')`, но транспилятор TypeScript будет применять эти же правила и к `import ... from "...";`
Однако при этом в `module` указано значение `ESNext`. Этим значением мы говорим, что в результате транспиляции мы хотим получить код, использующий ECMAScript модули. Здесь мы получаем противоречие: сам код будет транспилирован в ECMAScript модули, но
способ импортирования других файлов будет таким будто он будет разрешаться с помощью правил для commonjs модулей.

### Пример 2
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
### Пример 3
В последнем примере мы исправили ошибку из второго примера, изменив в tsconfig.json `"module": "ESNext"` на `"module": "NodeNext"`. Таким образом мы указали транспилятору
TypeScript, что полученный в результате код будет запущен в современной версии node.js, которая одновременно может работать с commonjs модулями и с ECMAScript модулями

Собираем пример и видим, что никаких ошибок при транспиляции нет
```bash
npm run build
```

При запуске на node версии от 14 и выше, так же не видим никаких ошибок.
```bash
node build/index.js
```
Еще один интересный момент в этом примере, давайте попробуем изменить параметр `type` в файле package.json на `commonjs` и собрать пример. В коде в папке `build`, мы увидим, что,
не меняя ничего в tsconfig.json, транспилятор TypeScript теперь собирает код не в виде ECMAScript модулей, а в виде commonjs модулей. В этом заключается универсальность модульной системы node.js



## Новые расширения
Поле `type` в package.json определяет модульную систему во всем проекте в целом, и вы можете использовать такие привычные расширения как `.ts` или `.js`, подразумевая, что код в таких файлах
соответствует именно указанной в `type` модульной системе. Однако бывает так, что код в некотором файле должен использовать отличную модульную систему от той, что указана в поле `type`. Для этого в Node.js есть расширения `.cjs`, если файл
является CommonJs модулем и `.mjs`, если файл является ECMAScript модулем. TypeScript здесь добавляет свои расширения  `.cts` и `.mts`, при транспиляции они превращаются в `.cjs` и `.mjs` соответственно

## Итоги
