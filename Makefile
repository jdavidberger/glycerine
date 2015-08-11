browse:
	browserify -p tsify --noImplicitAny main.ts -o bundle.js -v -d --debug
watch:
	watchify -p tsify main.ts -o bundle.js -v -d --debug
tsc:
	tsc --noImplicitAny  --out bundle.js main.ts --module commonjs 
	browserify -p tsify main.ts -o bundle.js -v -d --debug
