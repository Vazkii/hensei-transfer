function __hensei_import() {
    var data = __get_data();
    var auth = __get_auth();
    var partyId = data.party.id;

    var name = 'Kengo';
    var ctx = {
        data: data,
        party: partyId,
        auth: auth
    };

    __job(ctx, name);
    location.reload();
}  

function __job(ctx, name) {
    var id = __seek_id(ctx.data.jobs, function(j) {
        return j['name']['en'] == name;
    });
    
    if(id.length > 0)
        __ajax(ctx, 'PUT', 'jobs', {party: {job_id: id}});
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

function __ajax(ctx, method, endpoint, payload) {
    var options = {
        method: method,
        headers: {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'authorization': `Bearer ${ctx.auth}`
        },
        body: JSON.stringify(payload)
    }
    fetch(`https://hensei-api-production-66fb.up.railway.app/api/v1/parties/${ctx.party}/${endpoint}`, options);
}

__hensei_import();