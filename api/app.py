#!flask/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, abort, make_response, request, redirect, url_for, send_from_directory
from flask_cors import CORS, cross_origin
from twitchstream.chat import TwitchChatStream
import threading
import time

# --------------------- twitch connection --------------------------
twitch = TwitchChatStream(username='andy_bear', oauth="oauth:xq4wjakbw4ay9dqphlt7eb17iiuyyq".encode())
twitch.connect()
twitch.join_channel("kamikat")
#twitch.twitch_receive_messages()

history = {}

def stringProcess(tmphistory, s, channel):
  words = s.split()
  #for word in words:
    #if history[channel][timestamp].has_key(word):
    #  history[channel][timestamp][word] += 1
    #else:
    #  history[channel][timestamp][word] = 1
  tmphistory[channel] += 1

def chatListProcess(chatList):
  now = time.time()
  tmphistory = {}
  for chat in chatList:
    channel = chat['channel']
    message = chat['message']
    username = chat['username']
    if not history.has_key(channel):
      history[channel] = []
    if not tmphistory.has_key(channel):
      tmphistory[channel] = 0
    stringProcess(tmphistory, message, channel)
  for channel in history:
    if tmphistory.has_key(channel):
      count = tmphistory[channel]
      history[channel].append([now, count])
    else:
      history[channel].append([now, 0])
  
def receive():
  threading.Timer(5.0, receive).start()
  chatList = twitch.twitch_receive_messages()

  chatListProcess(chatList)

  print "Hello, World!"
  print history



app = Flask(__name__)
CORS(app)

@app.route('/')
def test():
  return 'hello world!'

@app.route('/history', methods=['GET'])
def getHistory():
  if request.method == 'GET':
    return jsonify(history), 201

@app.route('/reset', methods=['POST'])
def resetConnect():
  if request.method == 'POST':
    twitch.connect()
    history = {}

@app.route('/add', methods=['POST'])
def addChannel():
  if request.method == 'POST':
    channelID = request.json[channelName]
    twitch.join_channel(channelID)
    return jsonify({'status': 'success'}), 201
  else:
    abort(400)


if __name__ == '__main__':
  receive()
  app.run(debug=False, host="0.0.0.0", port=5000, ssl_context="adhoc")

