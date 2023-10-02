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





