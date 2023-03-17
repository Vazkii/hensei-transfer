import requests

def get_temp():
	with open('aio.js') as f:
		aiojs = f.read()

		with open('export.js') as f1:
			exportjs = f1.read()
			with open('import.js') as f2:
				importjs = f2.read()
				aiojs = aiojs.replace('//GBFTOJSON', exportjs)
				aiojs = aiojs.replace('//JSONTOHENSEI', importjs)
				return aiojs

def minify(temp):
	url = 'https://www.toptal.com/developers/javascript-minifier/api/raw'
	res = requests.post(url, data = {'input': temp}, headers = {'content-type': 'application/x-www-form-urlencoded'})
	
	if res.status_code == 200:
		return res.text

def output(contents):
	with open('bookmarklet.js', 'w') as f:
		f.write('javascript:')
		f.write(contents.replace('%', '\\u0025'))

def main():
	temp = get_temp()
	minified = minify(temp)
	output(minified)


if __name__ == '__main__':
	main()