ifneq (,$(wildcard ./.env))
    include .env
    export
endif

build:
	python build.py

commit:
	git commit -am 'Autobuild'
	git push

deploy:
	 ssh -A ${DEPLOY_HOST} ${DEPLOY_CMD}

all: build commit deploy
