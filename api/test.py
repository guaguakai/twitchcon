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

def measureEmotion(list, emotion_total):
    #emotionl_total[0] is positive, emotionl_total[1] is negative, emotionl_total[2] is neutral
    for i in range(len(list)):
        for j in range(len(emoji_list)):
            if list[i] == emoji_list[j]:
                if emotion_list[j] == "positive":
                    emotion_total[0] = emotion_total[0] + 1
                elif emotion_list[j] == "negative":
                    emotion_total[1] = emotion_total[1] + 1
                else:
                    emotion_total[2] = emotion_total[2] + 1


emotion_total = [0, 0, 0]

list = ["hi", "name", ":)", ":)", ":(", "blah", "riPepperonis", "twitchRaid"]

measureEmotion(list, emotion_total)

print(emotion_total)
