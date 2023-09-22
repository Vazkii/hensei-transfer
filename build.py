import requests

def get_temp():
	aiojs = read_file('aio.js')
	exportjs = read_file('export.js')
	importjs = read_file('import.js')
	version = incr_version()

	aiojs = aiojs.replace('//GBF-TO-JSON', exportjs)
	aiojs = aiojs.replace('//JSON-TO-HENSEI', importjs)
	aiojs = aiojs.replace('//HENSEI-TRANSFER-VERSION', 'var version = ' + version + ';')

	return aiojs

def incr_version():
	version = int(read_file('version').strip())
	version += 1

	version = str(version)

	with open('version', 'w') as f:
		f.write(version)

	return version

def read_file(fname):
	with open(fname) as f:
		return f.read()

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