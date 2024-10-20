# Makefile
build:
	npm run build

clean:
	rm -rf dist

watch:
	tsc --watch

.PHONY: build clean watch