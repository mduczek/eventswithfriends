import json


class Event(object):

    def __init__(self, ident, title, url, description, user_id, address, datetime, suggested_friends = "", friend_id='', is_fb_event=True, priority=0, funness=0, image=''):
        self.ident = ident
        self.title = title
        self.url = url
        self.description = description
        self.user_id = user_id
        self.is_fb_event = is_fb_event
        self.address = address
        self.datetime = datetime
        self.priority = priority
        self.image = image
        self.suggested_friends = suggested_friends
        self.friend_id = friend_id
        self.is_fb_event = is_fb_event

    def evaluate_priority(self, interests):
        priority = 0

        for like_names in interests.itervalues():
            for like_name in like_names:
                print("self.title: " + self.title)
                print("like_name: " + str(like_name))
                priority += self.title.count(str(like_name))
                #priority += self.description.count(str(like_name))
                print priority

        self.priority = priority
        return priority

    def evaluate_funness(self, friend_scores):
        funness = 0

        for fid in self.friend_id:
            for friend_score in friend_scores:
                if fid == friend_score[0]: # friend ids match
                    funness += friend_score[1]

        self.funness = funness
        return funness

    def get_sum():
        return self.priority + self.funness

    def set_suggested_friends(self, friends_list):
        self.suggested_friends = friends_list

    def set_priority(self, priority):
        self.priority = priority

    def serializeEvent(self):
        # return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)
        return json.dumps(self.__dict__)

def deserializeEvent(json_string):
    obj = json.loads(json_string)
    return Event(**obj)