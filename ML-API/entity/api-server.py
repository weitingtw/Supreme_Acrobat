import flask

from flask import request
from flask_restful import Api, Resource

import numpy as np
from transformers import BertTokenizer, BertConfig, RobertaTokenizer
from transformers import BertForTokenClassification, RobertaForTokenClassification
import torch
import torch.nn.functional as F
import pickle
import codecs
from nltk import word_tokenize

from pprint import pprint


def tokenize(s):
    s = s.replace('-', ' - ')       # deal with special case 17-year-old
    return ' '.join(word_tokenize(s))


class Predict(Resource):
    def __init__(self, model):
        self.model = model

    def get(self):
        # prepare the query
        f = open('./model_save/tag2idx.pckl', 'rb')
        tag2idx = pickle.load(f)
        device = torch.device("cpu")

        output_dir = './model_save/'
        idx2tag = dict((v,k) for k, v in tag2idx.items())
        tokenizer = RobertaTokenizer.from_pretrained(output_dir)
        model = RobertaForTokenClassification.from_pretrained(output_dir)
        model.aux_logits = False
        model.to(device)
   
        params = request.args
        query = params['query']
        query = query.strip()
        all_tokens = []
        origin_tokens = query.split(' ')
        #print(origin_tokens)
        all_entities = []
        entity_types = []
        tokenized_sentence = tokenizer.encode(query)
        input_ids = torch.tensor([tokenized_sentence]).to(device)

        predictions = []
        with torch.no_grad():
            output = model(input_ids)
            output = output[0].detach().cpu().numpy()
            predictions.extend([list(p) for p in np.argmax(output, axis=2)])


        tags_predictions = []
        for x in predictions[0]:
            tags_predictions.append(idx2tag[int(x)])

        tokens = []
        count = 0
    
        ### get tokens from ids
        for x in tokenizer.convert_ids_to_tokens(tokenized_sentence):
            if count == 1:
                tokens.append(x)
            elif x[0] == 'Ġ':
                tokens.append(x[1:])
            else:
                tokens.append(x)
            count+=1

        wordIndex = 0
        startIndex = 0
        entityIndex = 0
        entity_types.append(tags_predictions[1:-1])

        for x in tokens[1:-1]:
            entity = entity_types[0][entityIndex]
            entityIndex += 1
            if wordIndex == len(origin_tokens):
                break 
            if origin_tokens[wordIndex] == '' or origin_tokens[wordIndex] == ' ':
                wordIndex += 1
                startIndex = 0
                continue
            if x in origin_tokens[wordIndex].lower():
                if startIndex == 0:
                    all_tokens.append(origin_tokens[wordIndex])
                    all_entities.append(entity)
                    #if(len(entity) < 2):
                        #all_entities.append(entity)
                    #else:
                        #all_entities.append(entity[2:])
                startIndex = startIndex + len(x)
                if startIndex  >= len(origin_tokens[wordIndex]):
                    wordIndex += 1
                    startIndex = 0
            


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
    output_dir = './model_save/'
    tokenizer = RobertaTokenizer.from_pretrained(output_dir)
    model = RobertaForTokenClassification.from_pretrained(output_dir)
    model.to(device)
    
    app = flask.Flask(__name__)
    api = Api(app)
    api.add_resource(Predict, '/', resource_class_kwargs={'model': model})
    app.run(host="0.0.0.0",debug=True, port=5000)

