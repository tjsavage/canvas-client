class BaseModule(object):
	def __init__(self, client, options):
		self.client = client
		self.options = options

	def onEvent(self, message):
		raise NotImplementedError

	def onAction(self, message):
		raise NotImplementedError

	
