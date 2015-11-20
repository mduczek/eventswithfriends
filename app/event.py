import json


class Event(object):

    def __init__(self, ident, title, url, description, user_id, address, datetime, suggested_friends = "", friend_id='', is_fb_event=True, priority=0, image=''):
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