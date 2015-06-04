var exec = require('child_process').exec;


//ifconfig | grep "inet addr" | awk '{print $2}'
exports.getIPs = function( cb ){
	exec('ifconfig | grep "inet addr" | awk \'{print $2}\'' , function(err,stdout){
		cb.call(this,stdout.match(/(\d+\.){3}\d+/g))
	});
}

//debug
//exports.getIPs( function(ips){ console.log(ips) } );