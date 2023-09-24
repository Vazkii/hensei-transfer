const awakenings = {
    'Attack': 'atk',
    'Defense': 'def',
    'Special': 'spec',
    'C.A.': 'ca',
    'Healing': 'heal',
    'Skill DMG': 'skill'
};
const uncaps = [ '0mlb', '1mlb', '2mlb', 'mlb', 'flb', 'ulb', 'trans' ];
const summon_art_changes = {
    'Colossus Omega': 4,
    'Leviathan Omega': 4,
    'Yggdrasil Omega': 4,
    'Tiamat Omega': 4,
    'Luminiera Omega': 4,
    'Celeste Omega': 4,
    'Agni': 5,
    'Varuna': 5,
    'Titan': 5,
    'Zephyrus': 5,
    'Zeus': 5,
    'Hades': 5,
};
const key_mappings = { 
    // Opus and Ultima s2
    auto:  ['1240', '758'],
    skill: ['1241', '759'],
    ougi: ['1242', '760'],
    cb: ['1243', '761'],

    // Opus s3 and some Ultima s1
    stamina: ['502-507', '1213-1218', '727-736'],
    enmity: ['130-135', '71-76', '737-746'],
    tirium: ['1260-1265', '1266-1271'],
    progression: ['1199-1204', '1205-1210'],

    // Belial Chains
    celere: ['322-327', '1310-1315'],
    majesty: ['764-769', '1731-1735', '948'],
    glory: ['1171-1176', '1736-1741'],
    freyr: '1723',
    apple: '1724',
    depravity: '1725',
    echo: '1726',

    // Ultima s1
    atk: '697-706',
    ma: '707-716',
    hp: '717-726',
    crit: '747-756',

    // Ultima s3
    cap: '1807',
    healing: '1808',
    seraphic: '1809',
    cbgain: '1810',

    // Draconic s2
    def: '1446',
    fire: '1447',
    water: '1448',
    earth: '1449',
    wind: '1450',
    light: '1451',
    dark: '1452',

    // Draconic s3
    primal: '1228-1233',
    magna: '1234-1239'
};
var elements = [ "Fire", "Water", "Earth", "Wind", "Light", "Dark"]

function convert_to_wiki(str) {
    var obj = JSON.parse(str);
    if(obj.lang != 'en')
        return 'Please change your game to English before exporting.';

    var str = '=== ' + obj.name + ' ===';
    str += '\n{{TeamSpread';
    str += '\n|team=' + get_team(obj);
    str += '\n|weapons=' + get_grid(obj);
    str += '\n|summons=' + get_summons(obj);
    str += '\n}}'

    return str;
}

function get_team(obj) {
    var str = '{{Team';

    str += '\n|class=' + obj.class.toLowerCase();
    for(var i in obj.characters) {
        var ch = obj.characters[i];
        var n = parseInt(i) + 1;

        str += '\n|char' + n + '=' + ch.name;
        if(ch.transcend)
            str += '|trans' + n + '=' + ch.transcend;

        var art = character_art(ch);
        if(art)
            str += '|art' + n + '=' + art;
    }

    for(var i in obj.subskills) {
        var ss = obj.subskills[i];
        var n = parseInt(i) + 1;
        str += '\n|skill' + n + '=' + ss;
    }

    str += '\n|main=' + obj.summons[0].name;
    str += '\n|support=' + obj.friend_summon;

    str += '\n}}';
    return str;
}

function character_art(ch) {
    var u = ch.uncap;
    return u == 6 ? 'D' : u == 5 ? 'C' : null;
}

function get_grid(obj) {
    var str = '{{WeaponGridSkills';

    var opus = null;
    var draconic = null;
    var ultima = null;

    for(var i in obj.weapons) {
        var wp = obj.weapons[i];

        var w = i == 0 ? 'mh' : ('wp' + i);
        var u = i == 0 ? 'umh' : ('u' + i);

        str += '\n|' + w + '=' + wp.name;
        if('attr' in wp)
            str += ' (' + elements[wp.attr] + ')';

        str += '|' + u + '=' + wp.uncap;

        if(wp.awakening) {
            var a = i == 0 ? 'awkmh' : ('awk' + i);
            str += '|' + a + '=' + awakenings[wp.awakening.type];
        }

        if(wp.keys) {
            if(wp.name.includes('Ultima'))
                ultima = wp;
            else if(wp.name.includes('iation'))
                opus = wp;
            else if(wp.name.includes('Draconic'))
                draconic = wp;
        }
    }

    str += get_keys(opus, 'opus');
    str += get_keys(draconic, 'draconic');
    str += get_keys(ultima, 'ultima');

    str += '\n}}';
    return str;
}

function get_keys(wp, type) {
    if(!wp)
        return '';

    str = '\n|' + type + '=';
    for(var i in wp.keys) {
        var k = wp.keys[i];
        if(i != 0)
            str += ',';

        str += map_key_id(parseInt(k));
    }

    return str;
}

function map_key_id(id) {
    for(var e in key_mappings) {
        var mapping = key_mappings[e];

        if(typeof mapping == 'string' && is_right_key(mapping, id))
            return e;
        else for(k in mapping) {
            var elm = mapping[k];
            if(is_right_key(elm, id))
                return e;
        }
    }

    return '';
}

function is_right_key(val, id) {
    if(val.includes('-')) {
        var toks = val.split('-');
        var left = parseInt(toks[0]);
        var right = parseInt(toks[1]);
        return id >= left && id <= right;
    }

    return parseInt(val) == id;
}

function get_summons(obj) {
    var str = '{{SummonGrid';
    var quick = -1;

    for(var i in obj.summons) {
        var sm = obj.summons[i];

        var s = i == 0 ? 'main' : ('s' + i);
        var u = i == 0 ? 'umain' : ('u' + i);
        var a = i == 0 ? 'main': i;

        str += '\n|' + s + '=' + sm.name;
        str += '|' + u + '=' + summon_uncap_lvl(sm);
        str += summon_art(sm, a);

        if(sm.qs)
            quick = i;
    }

    for(var i in obj.sub_summons) {
        var sm = obj.sub_summons[i];

        var n = parseInt(i) + 1;
        var s = 'sub' + n;
        var u = 'usub' + n;

        str += '\n|' + s + '=' + sm.name;
        str += '|' + u + '=' + summon_uncap_lvl(sm);
        str += summon_art(sm, s);
    }

    if(quick > -1) {
        var q = quick == 0 ? 'main' : quick;
        str += '\n|quick=' + q;
    }

    str += '\n}}';
    return str;
}

function summon_uncap_lvl(sm) {
    var u = sm.uncap;
    var str = uncaps[u];

    if(sm.transcend)
        str += sm.transcend;

    return str;
}

function summon_art(sm, n) {
    var key = summon_art_key(sm);
    if(!key)
        return '';

    return '|art' + n + '=' + key;
}

function summon_art_key(sm) {
    if(sm.transcend)
        return sm.transcend == 5 ? 'D' : 'C';

    if(sm.name in summon_art_changes)
        return sm.uncap >= summon_art_changes[sm.name] ? 'B' : 'A';

    return null;
}