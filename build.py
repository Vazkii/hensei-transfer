import requests

def get_aio(version):
	aiojs = read_file('incl/aio.js')
	aiojs = aiojs.replace('//GBF-TO-JSON', read_file('incl/gbf_to_json.js'))
	aiojs = aiojs.replace('//JSON-TO-HENSEI', read_file('incl/json_to_hensei.js'))
	aiojs = get_version_check(aiojs, version)

	return aiojs

def get_wiki(version):
	wikijs = read_file('incl/wiki.js')
	wikijs = wikijs.replace('//GBF-TO-JSON', read_file('incl/gbf_to_json.js'))
	wikijs = wikijs.replace('//JSON-TO-WIKI', read_file('incl/json_to_wiki.js'))
	wikijs = get_version_check(wikijs, version)

	return wikijs

def get_version_check(js, version):
	versionjs = read_file('incl/version_check.js')
	versionjs = versionjs.replace('//HENSEI-TRANSFER-VERSION', 'var version = ' + version + ';')
	return js.replace('//VERSION-CHECK', versionjs)

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

def output(name, contents):
	with open(name + '.js', 'w') as f:
		f.write('javascript:')
		f.write(contents.replace('%', '\\u0025'))

def main():
	version = incr_version()

	build('test_aio', get_aio(version))
	build('test_wiki', get_wiki(version))

def build(name, content):
	minified = minify(content)
	output(name, content)

if __name__ == '__main__':
	main()