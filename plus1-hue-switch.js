let CONFIG = {
    INPUT_ID: '0',
    HUE_HUB_IP: '192.168.1.1',
    HUE_LIGHT_ID: '1',
    HUE_KEY: '<api>'
};

let isLightOn = function(response) {
    if (result.code === 200) {
        let jsonBody = JSON.parse(result.body);
        return jsonBody.state.on;
    }
};

let switchLightState = function(currentState) {
    print('switching to: ' + JSON.stringify(!currentState))
    Shelly.call(
        "HTTP.Request", {
            method: 'PUT',
            url: "http://" + CONFIG.HUE_HUB_IP + "/api/" + CONFIG.HUE_KEY + "/lights/" + CONFIG.HUE_LIGHT_ID + "/state",
            body: currentState ? '{"on":false}' : '{"on": true}'
        },
    );
};

let processHueResponse = function(result, error_code, error) {
    switchLightState(
        isLightOn(result)
    );
};

let switchLight = function() {
    Shelly.call(
        "HTTP.GET", {
            url: "http://" + CONFIG.HUE_HUB_IP + "/api/" + CONFIG.HUE_KEY + "/lights/" + CONFIG.HUE_LIGHT_ID
        },
        processHueResponse
    );
};

Shelly.addEventHandler(function(event) {
    if (event.component === "input:" + CONFIG.INPUT_ID) {
        if (event.info.event === 'toggle') {
            switchLight();
        }
    }
}, null);
