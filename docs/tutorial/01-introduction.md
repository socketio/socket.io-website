{
    "name": "WS",
    "description": "WS Test",
    "type": "WEBSOCKET",
    "configuration":
    {
        "endpoint":
        {
            "protocol": "ws"
        },
        "additional":
        {
            "batching":
            {
                "maxPayloadSizePerReport": 0,
                "reportingInterval": 0
            },
            "retention":
            {
                "maxEventRetentionTimeInMin": 50,
                "maxNumEvents": 150000,
                "throttle": 500
            }
        },
        "security":{
        	"verifyServerCertificate": false,
        	"verifyServerHostName": false
        }
    }
}
