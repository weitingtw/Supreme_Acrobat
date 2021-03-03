#!/bin/bash
gunicorn -w 4 --threads 4 -b 0.0.0.0:5001 api-server2:app --timeout 600
