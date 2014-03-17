from ..canvas_module import BaseModule
from gmusicapi import Mobileclient, Webclient

class GooglePlayMusic(BaseModule):
	def __init__(self, client, options):
		super(GooglePlayMusic, self).__init__(client, options)

		self.api = Mobileclient()
		if self.api.login(self.options["username"], self.options["password"]):
			print "Login Successful"
		self.webClient = Webclient()
		self.webClient.login(self.options["username"], self.options["password"])

		#self.findRegisteredDevice()
		self.deviceId = self.options["deviceId"]
		self.speaker = self.options["speaker"]

		self.playing_track_list = False
		self.current_track_list = []
		self.current_track_index = 0

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
		if message["from"] == self.speaker:
			if message["event"] == "streamEnded":
				if self.playing_track_list:
					self.continue_track_list()

	def onAction(self, message):
		if message["action"] == "search_and_play":
			query = message["data"]["query"]
			self.search_and_play(query)

		if message["action"] == "stopMusic" or message["action"] == "stop":
			self.stop_music()

		if message["action"] == "startRadio":
			query = message["data"]["query"]
			self.start_radio(query)

	def search_and_play(self, query):
		results = self.api.search_all_access(query)
		if not len(results["song_hits"]) > 0:
			return
		song_data = results["song_hits"][0]["track"]
		print song_data
		self.play_track(song_data)

	def play_track(self, song_data):
		print "Playing %s, by %s" % (song_data["title"], song_data["artist"])
		stream_url = self.api.get_stream_url(song_data["nid"], self.deviceId)
		self.client.emitAction(self.speaker, "streamMP3", {"url": stream_url})

	def stop_music(self):
		self.playing_track_list = False
		self.client.emitAction(self.speaker, "stopStreaming", {})

	def start_radio(self, query):
		results = self.api.search_all_access(query, max_results=10)
		top_song = results["song_hits"][0] if len(results["song_hits"]) else None
		top_album = results["album_hits"][0] if len(results["album_hits"]) else None
		top_artist = results["artist_hits"][0] if len(results["artist_hits"]) else None

		if not top_song:
			top_song = {"score": 0}
		if not top_album:
			top_album = {"score": 0}
		if not top_artist:
			top_artist = {"score": 0}

		station_id = None
		if top_song["score"] > top_album["score"]and top_song["score"] > top_artist["score"]:
			station_id = self.api.create_station(query, track_id=top_song["track"]["nid"])
		elif top_album["score"] > top_song["score"] and top_album["score"] > top_artist["score"]:
			station_id = self.api.create_station(query, album_id=top_album["album"]["albumId"])
		else:
			station_id = self.api.create_station(query, artist_id=top_artist["artist"]["artistId"])
		
		tracks = self.api.get_station_tracks(station_id)
		
		self.play_track_list(tracks)

	def play_track_list(self, tracks):
		self.playing_track_list = True
		self.current_track_list = tracks
		self.current_track_index = 0
		self.play_track(self.current_track_list[0])

	def continue_track_list(self):
		self.current_track_index += 1
		self.play_track(self.current_track_list[self.current_track_index])
