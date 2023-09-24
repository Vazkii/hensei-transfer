(function() {
	function __gbf_export() {
		//GBF-TO-JSON
		__hensei_export(Game, function(str) {
			//JSON-TO-WIKI
			str = convert_to_wiki(str);
			__hensei_clipboard_copy(str);
			alert('Copied team data to clipboard!');
		});
	}

	//VERSION-CHECK

	if(window.location.href.includes('game.granbluefantasy.jp'))
		__gbf_export();
	else alert('Can only be used in game.granbluefantasy.jp');
})();