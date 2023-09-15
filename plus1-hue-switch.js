let CONFIG = {
    INPUT_ID: '0',
    SWITCH_TYPE: 'TOGGLE', // {TOGGLE, EDGE}
    HUE_HUB_IP: '192.168.1.1',
    HUE_LIGHT_ID: '1',
    HUE_KEY: '<api>'
};

let isLightOn = function(response) {
    if (response.code === 200) {
        let jsonBody = JSON.parse(response.body);
        return jsonBody.state.on;
    }
};

let invertLightState = function(currentState) {
    switchLightToState(!currentState)
};

let switchLightToState = function(wantedState) {
    print('switching to: ' + JSON.stringify(wantedState))
    Shelly.call(
        "HTTP.Request", {
            method: 'PUT',
            url: "http://" + CONFIG.HUE_HUB_IP + "/api/" + CONFIG.HUE_KEY + "/lights/" + CONFIG.HUE_LIGHT_ID + "/state",
            body: wantedState ? '{"on":true}' : '{"on": false}'
        },
    );
};

let processHueResponse = function(result, error_code, error) {
    invertLightState(
        isLightOn(result)
    );
};

let switchLight = function(switchState) {
  if (CONFIG.SWITCH_TYPE === 'EDGE') {
    Shelly.call(
        "HTTP.GET", {
            url: "http://" + CONFIG.HUE_HUB_IP + "/api/" + CONFIG.HUE_KEY + "/lights/" + CONFIG.HUE_LIGHT_ID
        },
        processHueResponse
    );
  } else if (CONFIG.SWITCH_TYPE === 'TOGGLE') {
      switchLightToState(switchState)
  }
};

Shelly.addEventHandler(function(event) {
    if (event.component === "input:" + CONFIG.INPUT_ID) {
        if (event.info.event === 'toggle') {
            switchLight(event.info.state);
        }
    }
}, null);
