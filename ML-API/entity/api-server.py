import flask

from flask import request
from flask_restful import Api, Resource
from nltk import word_tokenize

from transformers import BertTokenizer, BertConfig, RobertaTokenizer
from transformers import BertForTokenClassification, RobertaForTokenClassification
import torch
import numpy as np
from pprint import pprint


class Predict(Resource):
    def __init__(self, model):
        self.model = model

    def get(self):
        # prepare the query
        text = 'O, B-Diagnostic_procedure, I-Diagnostic_procedure,B-Biological_structure, I-Biological_structure, B-Sign_symptom, I-Sign_symptom, B-Detailed_description, I-Detailed_description, B-Lab_value, I-Lab_value, B-Date, I-Date, B-Age, I-Age, B-Clinical_event, I-Clinical_event, B-Date, I-Date, B-Disease_disorder, I-Disease_disorder, B-Nonbiological_location, I-Nonbiological_location, B-Severity, I-Severity, B-Sex, B-Therapeutic_procedure, I-Therapeutic_procedure'
        tag_values =  text.split(',')
        params = request.args
        query = params['query']
        query = "a boy has fever "
        tokenized_sentence = tokenizer.encode(query)
        input_ids = torch.tensor([tokenized_sentence]).cuda()

        with torch.no_grad():
            output = model(input_ids)
            label_indices = np.argmax(output[0].to('cpu').numpy(), axis=2)
        # predict
        # join bpe split tokens
        tokens = tokenizer.convert_ids_to_tokens(input_ids.to('cpu').numpy()[0])
        new_tokens, new_labels = [], []
        for token, label_idx in zip(tokens, label_indices[0]):
            if token.startswith("##"):
                new_tokens[-1] = new_tokens[-1] + token[2:]
            else:
                new_labels.append(tag_values[label_idx])
                new_tokens.append(token)


        pprint(new_labels)
        pprint(new_tokens)

        # preparing a response object and storing the model's predictions
        response = {
            'tokens': new_tokens,
            'entity_types': new_labels
        }

        # sending our response object back as json
        return flask.jsonify(response)


if __name__ == '__main__':
    device = torch.device("cpu")
    output_dir = './roberta_few_labels/'
    tokenizer =  RobertaTokenizer.from_pretrained(output_dir)
    model = RobertaForTokenClassification.from_pretrained(output_dir)
    model.to(device)
    
    app = flask.Flask(__name__)
    api = Api(app)
    api.add_resource(Predict, '/', resource_class_kwargs={'model': model})
    app.run(host="0.0.0.0",debug=True, port=5000)

