function __hensei_import() {
    var userString = __get_user_string();
    if(!userString)
        return;

    var input = JSON.parse(userString);
    var data = __get_data();
    var auth = __get_auth();
    var partyId = data.party.id;

    var ctx = {
        data: data,
        party: partyId,
        auth: auth
    };

    __info(ctx, input['name'], input['extra']);
    __job(ctx, input['class'], input['subskills']);

    //location.reload();
}  

function __info(ctx, name, extra) {
    __put(ctx, '', {party: {name: name, extra: extra}});
}

function __job(ctx, name, subskills) {
    var id = __seek_id(ctx.data.jobs, function(j) {
        return j['name']['en'] == name;
    });
    
    if(id.length > 0) {
        __put(ctx, 'jobs', {party: {job_id: id}});

        if(subskills.length > 0) {
            var subskillsObj = {};

            var i = 0;
            for(k in subskills) {
                var ssName = subskills[k];
                var ssId = __search(ctx, 'job_skills', {query: ssName, job: id, locale: 'en'}, function(s) {
                    return s['name']['en'] == ssName;
                });

                if(ssId.length > 0) {
                    i++;
                    subskillsObj[`skill${i}_id`] = ssId;
                }
            }

            __put(ctx, 'job_skills', {party: subskillsObj});
        }
    }
}

function __search(ctx, endpoint, query, filter) {
    var results = __fetch(ctx, 'POST', `search/${endpoint}`, {search: query});
    return __seek_id(results['results'], filter);
}

function __seek_id(arr, filter) {
    for(k in arr) {
        var obj = arr[k];
        if(filter(obj))
            return obj['id'];
    }

    return '';
}

function __get_auth() {
    var match = document.cookie.match(new RegExp('token%22%3A%22(.+?)%22'));
    if(match)
        return match[1];
}

function __get_data() {
    return JSON.parse($('#__NEXT_DATA__').text).props.pageProps.context;
}

function __get_user_string() {
    return '{"name":"Exec L","class":"Relic Buster","extra":true,"subskills":["Blitz Raid","Splitting Spirit","Fighting Spirit"],"characters":[{"name":"Alexiel","id":"3040232000","ringed":false,"uncap":4},{"name":"Florence","id":"3040429000","ringed":false,"uncap":4},{"name":"Nehan","id":"3040341000","ringed":false,"uncap":4},{"name":"Mugen","id":"3040428000","ringed":false,"uncap":4},{"name":"Aglovale","id":"3040322000","ringed":true,"uncap":4}],"weapons":[{"name":"Sword of Repudiation","id":"1040017000","uncap":5,"keys":["γ Revelation","Zion\'s Stamina"]},{"name":"Harmonia","id":"1040814500","uncap":4},{"name":"Harmonia","id":"1040814500","uncap":4},{"name":"Ultima Sword","attr":3,"id":"1040011900","uncap":5,"keys":["Gladius Plenum","Scandere Aggressio","Fulgor Impetus"]},{"name":"Luminiera Sword Omega","id":"1040007200","uncap":5,"ax":[{"id":1591,"val":"5.5"},{"id":1599,"val":"1"}]},{"name":"Luminiera Sword Omega","id":"1040007200","uncap":5,"ax":[{"id":1591,"val":"3"},{"id":1594,"val":"2"}]},{"name":"Cosmic Sword","id":"1040019500","uncap":4},{"name":"Luminiera Sword Omega","id":"1040007200","uncap":5,"ax":[{"id":1590,"val":"4"},{"id":1601,"val":"2_1.5"}]},{"name":"Luminiera Sword Omega","id":"1040007200","uncap":5,"ax":[{"id":1590,"val":"5"},{"id":1588,"val":"1"}]},{"name":"Luminiera Sword Omega","id":"1040007200","uncap":5,"ax":[{"id":1590,"val":"6"},{"id":1601,"val":"2_1.5"}]},{"name":"Shooting of The Star","id":"1040513700","uncap":4},{"name":"Sword of Pallas Militis","id":"1040022600","uncap":3}],"summons":[{"name":"Beelzebub","id":"2040408000","uncap":4},{"name":"The Star","id":"2040319000","uncap":5},{"name":"Halluel and Malluel","id":"2040275000","uncap":4},{"name":"Metatron","id":"2040330000","uncap":0},{"name":"Artemis","id":"2040381000","uncap":0}],"sub_summons":[{"name":"Yatima","id":"2040417000","uncap":4},{"name":"Belial","id":"2040347000","uncap":4}]}';
    //return prompt("Paste your Export here");
}

function __put(ctx, endpoint, payload) {
    __fetch(ctx, 'PUT', `parties/${ctx.party}/${endpoint}`, payload);
}

function __fetch(ctx, method, endpoint, payload) {
    var xhr = new XMLHttpRequest();
    var url = `https://hensei-api-production-66fb.up.railway.app/api/v1/${endpoint}`;
    xhr.open(method, url, false);
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.setRequestHeader('authorization', `Bearer ${ctx.auth}`)
    xhr.send(JSON.stringify(payload));
    return JSON.parse(xhr.responseText);
}

__hensei_import();