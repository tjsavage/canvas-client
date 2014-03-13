import sys, json
import client

if __name__ == "__main__":
	json_data = open(sys.argv[1])
	options = json.load(json_data)

	client.create_client(options)
	json_data.close()