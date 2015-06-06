# hsh

  > Micro client-side router via hashchange

## Install

```sh
npm install --save hsh
```

```sh
component install andrepolischuk/hsh
```

## API

### hsh(path, callback)

  Add `path` and `callback` to routing map.
  Each callback takes 2 arguments: `context` and `next`.

```js
hsh('/', index);
hsh('/about', about);
hsh('*', notFound);
```

### hsh(callback)

  Equivalent to `hsh('*', callback)`

### hsh()

  Start `hashchange` binding

### hsh.start()

  Equivalent to `hsh()`

### hsh.show(path)

  Calling `callback` to defined `path` without hash changing

### hsh.redirect(path)

  Internal redirect to `path`, example `/#/index`

### hsh.redirectExternal(path)

  External redirect, example `/index`

### hsh.current

  Return current path

### hsh.prefix

  Url prefix, default `''`

  * `''` - `/#/page`
  * `'!'` - `/#!/page`

## Routing

  Match to `/#/books`

```js
hsh('/books', list);
```

  Match to all paths prefixed with `/#/books`

```js
hsh('/books/*', show);
hsh('/books/:name', show);
hsh(/^\/books\/(.+)$/, show);
```

  Path `*` can be used after all for not found pages

```js
hsh('*', notFound);
```

## Context

### path

  Current path

### params

  Path parameters object

## Support

  * Internet Explorer 7+
  * Chrome
  * Safari
  * Firefox
  * Opera

## License

  MIT
