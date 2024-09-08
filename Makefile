ifneq (,$(wildcard ./.env))
    include .env
    export
endif

compress:
	terser js/functions.js --compress --mangle -o public/functions.min.js
	terser js/comments.js --compress --mangle -o public/comments.min.js
	terser js/utils.js --compress --mangle -o public/utils.min.js
	terser js/html.js --compress --mangle -o public/html.min.js
	terser js/ok-gesture.js --compress --mangle -o public/ok-gesture.min.js

	terser js/init-index.js --compress --mangle -o public/init-index.min.js
	terser js/init-home.js --compress --mangle -o public/init-home.min.js
	terser js/init-comments.js --compress --mangle -o public/init-comments.min.js
	terser js/init-search.js --compress --mangle -o public/init-search.min.js
	terser js/init-subreddit.js --compress --mangle -o public/init-subreddit.min.js
	terser js/init-user.js --compress --mangle -o public/init-user.min.js
	terser js/init-saved.js --compress --mangle -o public/init-saved.min.js

	find public -name init-\*.min.js -exec sed -i 's/CACHEBUSTER/'`strings /dev/urandom | grep -o '[[:alnum:]]' | head -n 8 | tr -d '\n'`'/g' {} \;

	terser public/r/slide-show/slide-show.js --compress --mangle -o public/r/slide-show/slide-show.min.js
	terser public/r/overflow-toggle/overflow-toggle.js --compress --mangle -o public/r/overflow-toggle/overflow-toggle.min.js

	cleancss -o public/styles.min.css css/styles.css
	cleancss -o public/r/slide-show/slide-show.min.css public/r/slide-show/slide-show.css
	cleancss -o public/r/overflow-toggle/overflow-toggle.min.css public/r/overflow-toggle/overflow-toggle.css

build:
	cp css/styles.css public/styles.min.css
	cp js/functions.js public/functions.min.js
	cp js/comments.js public/comments.min.js
	cp js/utils.js public/utils.min.js
	cp js/html.js public/html.min.js

	cp js/init-index.js public/init-index.min.js
	cp js/init-home.js public/init-home.min.js
	cp js/init-comments.js public/init-comments.min.js
	cp js/init-search.js public/init-search.min.js
	cp js/init-saved.js public/init-saved.min.js
	cp js/init-subreddit.js public/init-subreddit.min.js
	cp js/init-user.js public/init-user.min.js

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
