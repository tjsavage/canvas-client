from ..canvas_module import BaseModule
from gmusicapi import Mobileclient, Webclient

class GooglePlayMusic(BaseModule):
	def __init__(self, client, options):
		super(GooglePlayMusic, self).__init__(client, options)

		self.api = Mobileclient()
		if self.api.login(self.options["username"], self.options["password"]):
			print "Login Successful"
		self.webClient = Webclient()
		webClient.login(self.options["username"], self.options["password"])

		#self.findRegisteredDevice()
		self.deviceId = self.options["deviceId"]

	"""
	def findRegisteredDevice(self):
		webClient = Webclient()
		webClient.login(self.options["username"], self.options["password"])
		registered_devices = webClient.get_registered_devices()
		for device in registered_devices:
			if device["type"] == "PHONE":
				self.deviceId = device["id"][2:] #removes the 0x from the front
	"""

	def onEvent(self, message):
		pass

	def onAction(self, message):
		if message["action"] == "search_and_play":
			results = self.api.search_all_access(message["data"]["query"])
			if not len(results["song_hits"]) > 0:
				return
			song_data = results["song_hits"][0]["track"]
			print song_data
			stream_url = self.api.get_stream_url(song_data["nid"], self.deviceId)
			print stream_url
			audio = self.webClient.get_stream_audio(song_data["nid"])
			with open("output.mp3", 'wb') as output:
				output.write(audio)
