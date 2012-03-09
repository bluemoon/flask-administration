HTTP API
==========

Parameters:
_k : Key, keeps different API services unique and easier to sort
_n : Name of event you want to record, this has a limit of 255 characters
_p : The identity of the person doing the event, this will likely be the users email address or possibly a unique id, has a limit of 255 characters
_t : Timestamp of the event in the unix epoch format, used to keep events unique. This should only be used if you want to create an event in the past. 
_d : Data encoded in base64 format, this should only be used with the /events endpoint


JSON Format:

 [{  
   ‘_n’ : ‘event name’,
   ‘_p’ : ‘person’,
   ‘customProperty’ : ‘CustomDataHere’
 },
 {
   ‘_n’ : ‘second event name’
 }]
Response:

As this is intended to be a very lightweight protocol, the results are simply sent back in the text/plain mimetype. All endpoints follow this response.
1 - Data was logged
0 - Error, data was not logged


Endpoint(GET): /e

parameters: 
The event endpoint is for sending single events to a GET http endpoint
required: _n
Any other properties you'd like:
such as in this example, gender=male

/e?_p=bob@bob.com&_n=Signup&gender=male&_k=KEY

This request translates out to have the values, 
_p         - bob@bob.com
_n         - Signup
_k         - KEY
gender     - male
Sending data as base64:
/e?_d=eyJldmVudCI6ICJnYW1lIiwgInBy<... truncated>&_k=KEY  
If you choose to send the data in this manner it must adhere to the JSON format outlined above and then be encoded in base64.


Endpoint(POST): /e

parameters:
Accepts encoded forms and JSON with the key used in a manner such that the URL below is the URL that should be POSTed to.

/events?_k=KEY
