#python.exe -m pip install python-twitch-stream

from twitchstream.chat import TwitchChatStream
twitch = TwitchChatStream(username='andy_bear', oauth="oauth:xq4wjakbw4ay9dqphlt7eb17iiuyyq".encode())
twitch.connect()
twitch.join_channel("boxbox")
twitch.twitch_receive_messages()
