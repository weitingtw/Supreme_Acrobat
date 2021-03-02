#!/bin/bash
gunicorn -w 4 --threads 4 -b 0.0.0.0:5000 api-server:app --timeout 600
