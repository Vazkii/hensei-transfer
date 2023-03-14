function __export_hensei(deck) {
    var name = deck['name'];
    
    var out = {};
    out['name'] = name;
    out['class'] = deck['pc']['job']['master']['name'];
    console.log(out);
    
    alert(JSON.stringify(out));
}

__export_hensei(Game.view.deck_model.attributes.deck);