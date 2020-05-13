import flask

from flask import request
from flask_restful import Api, Resource
from transformers import BertTokenizer, BertConfig, RobertaTokenizer
from transformers import BertForTokenClassification, RobertaForTokenClassification
import torch
import numpy as np
import pickle


class Predict(Resource):
    def __init__(self, model):
        self.model = model

        f = open('./roberta/tags_vals.pckl', 'rb')
        self.tags_vals = pickle.load(f)
        f.close()

        f = open('./roberta/tag2idx.pckl', 'rb')
        tag2idx = pickle.load(f)
        f.close()
        self.idx2tag = dict((v,k) for k, v in tag2idx.items())

    def get(self):
        # prepare the query
        params = request.args
        query = params['query']
        
        # predict
        all_tokens = []
        all_entities = []
        
        tokenized_sentence = tokenizer.encode(query)
        input_ids = torch.tensor([tokenized_sentence]).to(device)
        
        predictions = []
        with torch.no_grad():
            output = self.model(input_ids)
            output = output[0].detach().cpu().numpy()
            predictions.extend([list(p) for p in np.argmax(output, axis=2)])
        
        tags_predictions = []
        for x in predictions[0]:
            tags_predictions.append(self.idx2tag[int(x)])

        
        tokens = []
        count = 0

        ### get tokens from ids
        for x in tokenizer.convert_ids_to_tokens(tokenized_sentence):
            if count == 1:
                tokens.append(x)
            else:
                tokens.append(x[1:])
            count+=1

        all_entities.append(tags_predictions[1:-1])
        all_tokens.append(tokens[1:-1])


        print(all_tokens)
        print(all_entities)

        # preparing a response object and storing the model's predictions
        response = {
            'tokens': all_tokens,
            'entity_types': all_entities
        }

        # sending our response object back as json
        return flask.jsonify(response)


if __name__ == '__main__':
    device = torch.device("cpu")
    output_dir = './roberta/'
    tokenizer =  RobertaTokenizer.from_pretrained(output_dir)
    model = RobertaForTokenClassification.from_pretrained(output_dir)
    model.to(device)
    
    app = flask.Flask(__name__)
    api = Api(app)
    api.add_resource(Predict, '/', resource_class_kwargs={'model': model})
    app.run(host="0.0.0.0",debug=True, port=5000)

