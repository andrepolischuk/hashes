# Hashes

  Micro client-side router

## Instalation

  Via script tag in page sources:

```html
<script src="/static/js/hashes.min.js"></script>
```

## API

### hashes(fn)

  Initialize router with `fn` callback

```js
hashes(function(route) {
  console.log(route);
});
```

### hashes.set(name, value)

  Reset hashes option

  * `pref` - hash prefix, default `#`
  * `index` - index hash, default `#/`

### hashes.set(options)

  Reset hashes options via options array

```js
hashes.set({
  'pref'  : '#!',
  'index' : '/index'
});
```

### hashes.redirectInternal(route)

  Internal redirect, example `/#/index`

### hashes.redirectExternal(route)

  External redirect, example `/index`

### hashes.route

  Return current route

## Support

* Internet Explorer 7+
* Chrome
* Safari
* Firefox
* Opera
