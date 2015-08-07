browse:
	browserify -p tsify --noImplicitAny main.ts -o bundle.js -v -d --debug
watch:
	watchify -p tsify main.ts -o bundle.js -v -d --debug
