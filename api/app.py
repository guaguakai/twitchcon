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
twitch.join_channel("nightblue3")
twitch.join_channel("handiofiblood")
#twitch.twitch_receive_messages()

history = {}

with open('updated_emoji.txt') as input_file:
   emoji_list = []
   for line in input_file:
       line = line.strip()
       emoji_list.append(line)

with open('emotion_from_emoji.txt') as input_file:
   emotion_list = []
   for line in input_file:
       line = line.strip()
       emotion_list.append(line)

def measureEmotion(words):
    #emotionl_total[0] is positive, emotionl_total[1] is negative, emotionl_total[2] is neutral
    emotion_total = [0, 0, 0]
    emojies = []
    for i in range(len(words)):
        for j in range(len(emoji_list)):
            if words[i] == emoji_list[j]:
                emojies.append(emoji_list[j])
                if emotion_list[j] == "positive":
                    emotion_total[0] = emotion_total[0] + 1
                elif emotion_list[j] == "negative":
                    emotion_total[1] = emotion_total[1] + 1
                else:
                    emotion_total[2] = emotion_total[2] + 1
    return emotion_total, emojies

def stringProcess(tmphistory, s, channel):
  words = s.split()

  emotion_total, emojies = measureEmotion(words)

  #for word in words:
    #if history[channel][timestamp].has_key(word):
    #  history[channel][timestamp][word] += 1
    #else:
    #  history[channel][timestamp][word] = 1

  tmphistory[channel]['# replies'] += 1
  tmphistory[channel]['positive'] += emotion_total[0]
  tmphistory[channel]['negative'] += emotion_total[1]
  tmphistory[channel]['neutral'] += emotion_total[2]
  tmphistory[channel]['emojies'] += emojies

def chatListProcess(chatList):
  now = time.time() * 1000
  tmphistory = {}
  for chat in chatList:
    channel = chat['channel']
    message = chat['message']
    username = chat['username']
    if not history.has_key(channel):
      history[channel] = {}
      history[channel]['# replies'] = []
      history[channel]['positive'] = []
      history[channel]['negative'] = []
      history[channel]['neutral'] = []
      history[channel]['emojies'] = []
    if not tmphistory.has_key(channel):
      tmphistory[channel] = {}
      tmphistory[channel]['# replies'] = 0
      tmphistory[channel]['positive'] = 0
      tmphistory[channel]['negative'] = 0
      tmphistory[channel]['neutral'] = 0
      tmphistory[channel]['emojies'] = []
    stringProcess(tmphistory, message, channel)
  for channel in history:
    if tmphistory.has_key(channel):
      repliesCount = tmphistory[channel]['# replies']
      positiveCount = tmphistory[channel]['positive']
      negativeCount = tmphistory[channel]['negative']
      neutralCount = tmphistory[channel]['neutral']
      history[channel]['# replies'].append([now, repliesCount])
      history[channel]['positive'].append([now, positiveCount])
      history[channel]['negative'].append([now, negativeCount])
      history[channel]['neutral'].append([now, neutralCount])
      history[channel]['emojies'] = tmphistory[channel]['emojies']
    else:
      history[channel]['# replies'].append([now, 0])
      history[channel]['positive'].append([now, 0])
      history[channel]['negative'].append([now, 0])
      history[channel]['neutral'].append([now, 0])
      history[channel]['emojies'] = []
  
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
  global history
  global twitch
  if request.method == 'POST':
    twitch.connect()
    history = {}
    return jsonify({'status': 'success'}), 201
  else:
    abort(400)


@app.route('/add', methods=['POST'])
def addChannel():
  if request.method == 'POST':
    channelID = request.json['channelName']
    twitch.join_channel(channelID)
    return jsonify({'status': 'success'}), 201
  else:
    abort(400)


if __name__ == '__main__':
  receive()
  app.run(debug=False, host="0.0.0.0", port=5000, ssl_context="adhoc")
  #app.run(debug=False, host="0.0.0.0", port=5000)

