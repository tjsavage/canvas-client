curl -XPOST 'https://api.wit.ai/speech' \
	-i -L \
	-H "Authorization: Bearer UAYF5C5GUYE7PO7FZNKQMJMFCUPQXVVY" \
	-H "Content-Type: audio/wav" \
	--data-binary "@output.wav"
