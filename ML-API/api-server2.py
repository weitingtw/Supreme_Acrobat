import flask

from flask import request
from flask_restful import Api, Resource
from nltk import word_tokenize

from flair.data import Sentence
from flair.models import SequenceTagger

from pprint import pprint
from joblib import dump, load
import numpy as np


class Predict(Resource):
    def __init__(self, model, prediction_model):
        self.model = model
        self.prediction_model = prediction_model

    def get(self):
        # prepare the query
        params = request.args
        query = params['query']
        query1 = params['query1']
        query2 = params['query2']

        # predict
        print("python")
        print(query)
        print(query1)
        print(query2)

        line = query.replace(query1, "<e1> " + query1 + " </e1>")
        line = line.replace(query2, "<e2> " + query2 + " </e2>")
        print (line)

        line = line.replace(",", " ")
        line = line.replace(".", " ")
        line = line.split()
        h_result = np.empty([1,0])
        for j in range(len(line)):
            word = None
            if line[j].lower() in model.keys():
                word = model[line[j].lower()]
            else:
                word = np.zeros((50,1),dtype='float64')
            data = word.reshape(1,50)
            h_result = np.hstack((h_result, data))
        for j in range(len(line), 100):
            h_result = np.hstack((h_result, np.full((1,50),0)))
        
        result = self.prediction_model.predict(h_result)[0]
        relation = ""
        if result == 0:
            relation = "BEFORE"
        elif result == 1:
            relation = "AFTER"
        elif result == 2:
            relation = "OVERLAP"
        # preparing a response object and storing the model's predictions
        response = {
            'relation': relation
        }

        # sending our response object back as json
        return flask.jsonify(response)


if __name__ == '__main__':
    prediction_model = load('relation_model.joblib') 
    model = load('glove_model.joblib')
    app = flask.Flask(__name__)
    api = Api(app)
    api.add_resource(Predict, '/', resource_class_kwargs={'model': model, 'prediction_model': prediction_model})
    app.run(debug=True, port=5001)

