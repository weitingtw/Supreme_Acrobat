import flask

from flask import request
from flask_restful import Api, Resource
from flask_cors import CORS

from pprint import pprint
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification
import torch


class Predict(Resource):
    def __init__(self, model):
        self.model = model

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
        
        input_ids = torch.tensor(tokenizer.encode(line, add_special_tokens=True)).unsqueeze(0)  # Batch size 1
        labels = torch.tensor([1]).unsqueeze(0)  # Batch size 1
        outputs = model(input_ids, labels=labels)
        loss, logits = outputs[:2]
        logits = logits.detach().cpu().numpy()
        
        result = int(np.argmax(logits, axis=1).flatten()[0])

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
        response = flask.jsonify(response)
        response.headers.add('Access-Control-Allow-Origin', '*')
        # sending our response object back as json
        return response


if __name__ == '__main__':
    device = torch.device("cpu")
    output_dir = './model_save/'
    tokenizer = BertTokenizer.from_pretrained(output_dir)
    model = BertForSequenceClassification.from_pretrained(output_dir)
    model.to(device)

    app = flask.Flask(__name__)
    CORS(app, allow_headers=['Content-Type', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods'])
    api = Api(app)
    api.add_resource(Predict, '/', resource_class_kwargs={'model': model})
    app.run(host="0.0.0.0",debug=True, port=5001)

