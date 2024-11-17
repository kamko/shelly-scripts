let CONFIG = {
    INPUT_ID: '0',
    SWITCH_TYPE: 'TOGGLE', // {TOGGLE, EDGE}
    HUE_HUB_IP: '192.168.1.1',
    HUE_LIGHT_ID: '1',
    HUE_LINKED_LIGHT_IDS: ['2'],
    HUE_KEY: '<api>'
};

let setLightStateTo = function(lightId, wantedState) {
      Shelly.call(
        "HTTP.Request", {
            method: 'PUT',
            url: "http://" + CONFIG.HUE_HUB_IP + "/api/" + CONFIG.HUE_KEY + "/lights/" + lightId + "/state",
            body: wantedState ? '{"on":true}' : '{"on": false}'
        },
    );
}

let isLightOn = function(response) {
    if (result.code === 200) {
        let jsonBody = JSON.parse(result.body);
        return jsonBody.state.on;
    }
};

let invertLightState = function(currentState) {
    switchLightToState(!currentState)
};

let switchLightToState = function(wantedState) {
    print('switching to: ' + JSON.stringify(wantedState))
    
    setLightStateTo(CONFIG.HUE_LIGHT_ID, wantedState);
    CONFIG.HUE_LINKED_LIGHT_IDS.forEach(function(id) { 
      setLightStateTo(id, wantedState); 
    })
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
