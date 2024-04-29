ifneq (,$(wildcard ./.env))
    include .env
    export
endif

compress:
	terser js/functions.js --compress --mangle -o public/functions.min.js
	terser js/comments.js --compress --mangle -o public/comments.min.js
	terser public/r/slide-show/slide-show.js --compress --mangle -o public/r/slide-show/slide-show.min.js
	terser public/r/overflow-toggle/overflow-toggle.js --compress --mangle -o public/r/overflow-toggle/overflow-toggle.min.js

	cleancss -o public/styles.min.css css/styles.css
	cleancss -o public/r/slide-show/slide-show.min.css public/r/slide-show/slide-show.css
	cleancss -o public/r/overflow-toggle/overflow-toggle.min.css public/r/overflow-toggle/overflow-toggle.css

build:
	cp css/styles.css public/styles.min.css
	cp js/functions.js public/functions.min.js
	cp js/comments.js public/comments.min.js
	python build.py

build-min: compress
	python build.py --minify

serve: build
	cd public && python -m http.server 8000


commit: compress
	git commit -am 'Autobuild'
	git push

build-deps:
	npm install clean-css-cli -g
	npm install terser -g

deploy: build-min commit
	 ssh -A ${DEPLOY_HOST} ${DEPLOY_CMD}
