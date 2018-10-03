
exports.handler = (event, context, callback) => {
     context.callbackWaitsForEmptyEventLoop = true; 
    
    
    var AWS = require('aws-sdk');
    var iotdata = new AWS.IotData({endpoint: 'a8kxn92m7qup2.iot.eu-west-2.amazonaws.com', apiVersion: '2015-05-28'});  

    var current_hour;
    var params2;
    const mysql = require('mysql');

	const connection = mysql.createConnection({
  		host: 'prova1esiot.ctznysp572d1.eu-west-2.rds.amazonaws.com',
  		user: 'andrea',
  		password: 'ciao123456',
  		database: 'Users'
	});
    
	connection.connect((err) => {
  		if (err) throw err;
  		console.log('Connected!');
	});
	
	console.log(event.token);
	
    connection.query('SELECT * FROM request where token = ?', event.token, (err, rows, fields) =>{ 
        if (err){
            callback(null, "Access denied");
            connection.end();
          throw err;  
        }
        console.log('SELECT OK');
        params2 = [rows[0].idPorta, rows[0].idUtente, rows[0].token];
            current_hour = Date.now();
            var diff = current_hour - rows[0].time;
            
                if((diff <= 60000) && (rows[0].used == '0')){
                    connection.query('UPDATE request SET used = 1 WHERE idPorta = ? AND idUtente = ? AND token = ?', params2, (err)=>{
                        if(err) throw err;
                            
                            var params = {
                                  topic: '$aws/things/door1/shadow/update', 
                                  payload: '{"state" : {"desired" : {"status" : "open"}}}',
                                  qos:0
                            };

                            return iotdata.publish(params, function(err, data){
                                  if (err) console.log(err, err.stack); // an error occurred
                                  else     console.log(data);           // successful response
                                  
                                  callback(null, "access allowed");
                                  connection.end();
                            });
                            
                        });
                }else{
                    
                    callback(null, "Access denied");
                    connection.end();
                }
	});
    
    return 'ok';  
    
};