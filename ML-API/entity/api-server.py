import flask

from flask import request
from flask_restful import Api, Resource
from nltk import word_tokenize
from flask_cors import CORS, cross_origin

from flair.data import Sentence
from flair.models import SequenceTagger

from pprint import pprint


def tokenize(s):
    s = s.replace('-', ' - ')       # deal with special case 17-year-old
    return ' '.join(word_tokenize(s))

"""
class Predict(Resource):
    def __init__(self, model):
        self.model = model

    def get(self):
        # prepare the query
        params = request.args
        query = params['query']
        query = [tokenize(q) for q in query.split('\\n')]

        # predict
        all_tokens = []
        all_entities = []
        for q in query:
            sen = Sentence(q)

            self.model.predict(sen)
            tokens = []
            entity_types = []
            for t in sen.tokens:
                token = t.text
                entity = t.tags['ner'].value
                tokens.append(token)
                entity_types.append(entity)

            all_tokens.append(tokens)
            all_entities.append(entity_types)

        # pprint(all_tokens)
        # pprint(all_entities)

        # preparing a response object and storing the model's predictions
        response = {
            'tokens': all_tokens,
            'entity_types': all_entities
        }
        response = flask.jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')
        # sending our response object back as json
        return response


if __name__ == '__main__':
    model = SequenceTagger.load_from_file('best-model.pt')

    app = flask.Flask(__name__)
    CORS(app, allow_headers=['Content-Type', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods'],origins=['127.0.0.1:3001'])
    api = Api(app)
    api.add_resource(Predict, '/', resource_class_kwargs={'model': model})
    app.run(host="0.0.0.0",debug=True, port=5000)
"""
model = SequenceTagger.load_from_file('best-model.pt')
app = flask.Flask(__name__)
@app.route("/", methods = ['GET'])
@cross_origin(origin='*')
def predict():
    print("-------NER SERVER LOGGING-------\n")
    print("args:\n")
    print(request.args)
    params = request.args
    if (params):
        query = params['query']
        query = [tokenize(q) for q in query.split('\\n')]

        # predict
        all_tokens = []
        all_entities = []
        for q in query:
            sen = Sentence(q)

            model.predict(sen)
            tokens = []
            entity_types = []
            for t in sen.tokens:
                token = t.text
                entity = t.tags['ner'].value
                tokens.append(token)
                entity_types.append(entity)

            all_tokens.append(tokens)
            all_entities.append(entity_types)

        # preparing a response object and storing the model's predictions
        response = {
            'tokens': sall_tokens,
            'entity_types': all_entities
        }
        response = flask.jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')
        # sending our response object back as json
        return response

if __name__ == '__main__':
    app.run(host="0.0.0.0",debug=True, port=5000)
