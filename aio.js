(function() {
	function __gbf_to_json() {
		//GBF-TO-JSON
	}
	function __json_to_hensei() {
		//JSON-TO-HENSEI
	}

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
		if(confirm('hensei-transfer has received an update. Please re-download the bookmarklet to ensure it\'s compatible with the latest granblue.team changes, or click Cancel to proceed anyway.')) {
			window.open("https://github.com/Vazkii/hensei-transfer", "_blank");
			return;	
		}

	if(window.location.href.includes('app.granblue.team'))
		__json_to_hensei();
	else if(window.location.href.includes('game.granbluefantasy.jp'))
		__gbf_to_json();
	else alert('Can only be used in game.granbluefantasy.jp or app.granblue.team');
})();