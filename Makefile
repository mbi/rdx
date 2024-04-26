ifneq (,$(wildcard ./.env))
    include .env
    export
endif

compress:
	terser public/functions.js --compress --mangle -o public/functions.min.js
	terser public/r/slide-show/slide-show.js --compress --mangle -o public/r/slide-show/slide-show.min.js
	terser public/r/overflow-toggle/overflow-toggle.js --compress --mangle -o public/r/overflow-toggle/overflow-toggle.min.js

	cleancss -o public/styles.min.css public/styles.css
	cleancss -o public/r/slide-show/slide-show.min.css public/r/slide-show/slide-show.css
	cleancss -o public/r/overflow-toggle/overflow-toggle.min.css public/r/overflow-toggle/overflow-toggle.css

build:
	python build.py

build-min: compress
	python build.py --minify

serve: build
	cd public && python -m http.server 8000


commit: compress
	git commit -am 'Autobuild'
	git push

deploy: build-min commit
	 ssh -A ${DEPLOY_HOST} ${DEPLOY_CMD}
