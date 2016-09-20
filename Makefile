REPORTER = spec

all: jshint test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000

jshint:
	jshint src test

init:
	npm install mocha chai parsimmon --save-dev

.PHONY: test tap unit jshint skel
