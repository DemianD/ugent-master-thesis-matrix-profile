FROM python:3.7.3-stretch

COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt

COPY . /app
WORKDIR /app

RUN cd seriesdistancematrix && python setup.py clean build install && cd ..

CMD if [ -z "$GITHUB_ACTION" ]; then python3 ./src/index.py; else cd matrix-profile-service && python3 -m unittest discover; fi
