function __hensei_transfer_version_check() {
	//HENSEI-TRANSFER-VERSION
	var xhr = new XMLHttpRequest();
	var time = new Date().getTime();
	var url = 'https://raw.githubusercontent.com/Vazkii/hensei-transfer/main/version?_anti_cache_measures=' + time;
	xhr.open('GET', url, false);
	xhr.send();

	var resp = xhr.response.trim();
	return version == resp;
}

if(!__hensei_transfer_version_check())
	if(confirm('hensei-transfer has received an update. Please re-download the bookmarklet to ensure it\'s compatible with the latest changes, or click Cancel to proceed anyway.')) {
		window.open("https://github.com/Vazkii/hensei-transfer", "_blank");
		return;	
	}