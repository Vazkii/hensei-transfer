(function() {
	function __gbf_to_json() {
		//GBF-TO-JSON
		__hensei_export(Game, function(str) {
			__hensei_clipboard_copy(str);
			if(confirm('Copied team data to clipboard! If you press OK, a new tab in granblue.team will be open now - click the bookmark again on it and paste your data in there.'))
            	window.open('https://granblue.team', '_blank');
		});
	}
	function __json_to_hensei() {
		//JSON-TO-HENSEI
	}

	//VERSION-CHECK

	if(window.location.href.includes('granblue.team'))
		__json_to_hensei();
	else if(window.location.href.includes('game.granbluefantasy.jp'))
		__gbf_to_json();
	else alert('Can only be used in game.granbluefantasy.jp or granblue.team');
})();
