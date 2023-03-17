(function() {
	function __gbf_to_json() {
		//GBFTOJSON
	}
	function __json_to_hensei() {
		//JSONTOHENSEI
	}
	if(window.location.href.includes('app.granblue.team'))
		__json_to_hensei();
	else if(window.location.href.includes('game.granbluefantasy.jp'))
		__gbf_to_json();
	else alert('Can only be used in game.granbluefantasy.jp or app.granblue.team');
})();