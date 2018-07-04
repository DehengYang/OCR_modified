# coding=UTF-8

import BaseHTTPServer
import json
from ocr import OCRNeuralNetwork
import numpy as np
import random
import os
import pytesseract
from PIL import Image
import base64

HOST_NAME = 'localhost'
PORT_NUMBER = 8000
HIDDEN_NODE_COUNT = 20

# Load data samples and labels into matrix
data_matrix = np.loadtxt(open('data.csv', 'rb'), delimiter = ',')
data_labels = np.loadtxt(open('dataLabels.csv', 'rb'))

# Convert from numpy ndarrays to python lists
data_matrix = data_matrix.tolist()
data_labels = data_labels.tolist()

# If a neural network file does not exist, train it using all 5000 existing data samples.
# Based on data collected from neural_network_design.py, 15 is the optimal number
# for hidden nodes
nn = OCRNeuralNetwork(HIDDEN_NODE_COUNT, data_matrix, data_labels, list(range(5000)));
# nn._draw(data_matrix[0])

class JSONHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_POST(s):
        response_code = 200
        response = ""
        var_len = int(s.headers.get('Content-Length'))
        content = s.rfile.read(var_len);
        payload = json.loads(content);

        if payload.get('train'):
            nn.train(payload['trainArray'])
            nn.save()
        elif payload.get('predict'):
            try:
                response = {"type":"test", "result":nn.predict(str(payload['image']))}
            except:
                response_code = 500
        elif payload.get('show'):
            randShow=random.randint(0, 4999)
            data=data_matrix[randShow]
            label=data_labels[randShow]
            print("the data in server.py:")
            print(data)
            print("the predict result in server.py:")
            print(nn.predict(data))
            print("label:")
            print(label)
            nn._draw(data)  #[:-1]
            data.append(label)

            try:
                response = {"type":"show", "result":data}
            except:
                response_code = 510
        elif payload.get('ocr'):
            # cmd="tesseract "+ str(payload['image']) + " 1.txt"
            # os.system(cmd)
            # print(str(payload['img']))
            print('payload.get(ocr) in server.py')
            print(payload.get('ocr'))
            img=str(payload['img'])
            print("  len: ")
            print(len(img))
            img=img.split(',')[1:]
            img=''.join(img)
            # img = base64.b64decode(str(payload['img']),"utf-8")
            # img = base64.b64decode(payload.get('image'))

            file = open('test.jpg', 'wb')
            # print('the img in server.py is %s',img)
            print('the img in server.py is')
            print(img)
            print("  len: ")
            print(len(img))

            imgdata = base64.b64decode(img)
            file.write(imgdata)
            file.close()


            image = Image.open('test.jpg')
            code = pytesseract.image_to_string(image)
            # print(code)
            try:
                response = {"type":"ocr", "result":code}
            except:
                response_code = 520
        else:
            response_code = 400

        s.send_response(response_code)
        s.send_header("Content-type", "application/json")
        s.send_header("Access-Control-Allow-Origin", "*")
        s.end_headers()
        if response:
            s.wfile.write(json.dumps(response))
        return

if __name__ == '__main__':
    server_class = BaseHTTPServer.HTTPServer;
    httpd = server_class((HOST_NAME, PORT_NUMBER), JSONHandler)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    else:
        print "Unexpected server exception occurred."
    finally:
        httpd.server_close()
