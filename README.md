# Hsh

  Micro client-side router

## Instalation

  Browser:

```html
<script src="//cdn.rawgit.com/andrepolischuk/hsh/1.1.0/hsh.min.js"></script>
```

  Component(1):

```sh
$ component install andrepolischuk/hsh
```

  Npm:

```sh
$ npm install hsh
```

## API

### hsh(fn)

  Initialize router with `fn` callback

```js
hsh(function(route) {
  console.log(route);
});
```

### hsh.set(name, value)

  Reset hsh option

  * `pref` - hash prefix, default `#`
  * `index` - index hash, default `#/`

### hsh.set(options)

  Reset hsh options via options array

```js
hsh.set({
  'pref'  : '#!',
  'index' : '/index'
});
```

### hsh.redirectInternal(route)

  Internal redirect, example `/#/index`

### hsh.redirectExternal(route)

  External redirect, example `/index`

### hsh.route

  Return current route

## Support

* Internet Explorer 7+
* Chrome
* Safari
* Firefox
* Opera
