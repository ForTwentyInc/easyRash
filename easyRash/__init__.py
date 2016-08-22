import logging.config
from flask import Flask

conf = {"version": 1,
"disable_existing_loggers": False,
"formatters": {
"default": {
    "format": "%(asctime)s %(levelname)s %(name)s %(message)s"
},
},
"handlers": {
"file":{
  "class": "logging.handlers.RotatingFileHandler",
  "level":"DEBUG",
  "formatter": "default",
  "filename": "logs/flask.log",
  "maxBytes": 50000,
  "backupCount": 20,
  "encoding": "utf-8",
},
},
"root": {
"handlers": ["file"],
"level": "DEBUG",
}}

logging.config.dictConfig(conf)
# configuring logger

app = Flask(__name__)
app.config.from_object('config')
#importing modules and config
from easyRash import views
from easyRash import api
