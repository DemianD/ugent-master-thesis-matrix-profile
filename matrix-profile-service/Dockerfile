FROM python:3.7.3-stretch

COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt

COPY . /app
WORKDIR /app

RUN cd seriesdistancematrix && python setup.py clean build install && cd ..

CMD ["bash", "run.sh"]
