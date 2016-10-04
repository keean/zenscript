REPORTER = spec

all: test

test:
	-node_modules/jshint/bin/jshint src test
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000

init:
	npm install mocha chai parsimmon jshint --save-dev

.PHONY: test tap unit jshint skel
