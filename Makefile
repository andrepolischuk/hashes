
default: test

test: build
	@open test/index.html

clean:
	@rm -rf build.js hsh.js hsh.min.js components node_modules

build: $(wildcard test/*.js)
	@duo --development --stdout test/test.js > build.js

bundle: index.js
	@duo --standalone hsh --stdout index.js > hsh.js
	@uglifyjs hsh.js --mangle --compress --output hsh.min.js

.PHONY: clean test
