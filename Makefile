REPORTER = spec

all: jshint test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000

jshint:
	node_modules/jshint/bin/jshint -evil src test

init:
	npm install mocha chai parsimmon jshint --save-dev

.PHONY: test tap unit jshint skel
