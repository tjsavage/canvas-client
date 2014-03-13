from socketIO_client import SocketIO
import importlib

class CanvasClient(object):
    def __init__(self, options):
        self.name = options["name"]
        self.moduleName = options["moduleName"]
        self.className = options["className"]
        if not self.className:
            raise Exception("Must give python modules a class name in options")
        self.serverIP = options["serverIP"]
        self.serverPort = options["serverPort"]
        self.options = options

        module = importlib.import_module("modules.%s" % self.moduleName)
        klass = getattr(module, self.className)
        self.module = klass(self, self.options)
        self.socket = None

    def connect(self):
        self.socketIO = SocketIO(self.serverIP, self.serverPort)
        self.socketIO.on('event', self.onEvent)
        self.socketIO.on('action', self.onAction)
        self.socketIO.wait()

    def disconnect(self):
        self.socketIO.disconnect()

    def onEvent(self, message):
        print "%s %s %s" % (self.name, "onEvent", message)
        self.module.onEvent(message)

    def onAction(self, message):
        print "%s %s %s" % (self.name, "onAction", message)
        if "to" in message and message["to"] == self.name:
            self.module.onAction(message)

    def emitEvent(self, event, eventData):
        message = {
            "from": self.name,
            "event": event,
            "data": eventData
        }
        print "%s %s %s" % (self.name, "emitEvent", message)
        self.socketIO.emit("event", message)

    def emitAction(self, to, action, data):
        message = {
            "from": self.name,
            "to": to,
            "action": action,
            "data": data
        }
        print "%s %s %s" % (self.name, "emitAction", message)
        self.socketIO.emit("action", message)

def create_client(options):
    client = CanvasClient(options)
    client.connect()