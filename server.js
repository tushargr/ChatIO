var http=require('http');
var fs=require('fs');
var path=require('path');
var url=require('url');
var MongoClient=require('mongodb').MongoClient;
var dburl="mongodb://127.0.0.1:27017/";

const mimeTypes={
	"html": "text/html",
	"jpg": "image/jpg",	
	"jpeg": "image/jpeg",
	"js": "text/javascript",
	"css": "text/css",
	"ico": "image/ico",
	"png": "image/png",
	"woff":"font/woff",
	"gif":"image/gif",
		
}
// always make website considering the fact that different user will use same site. make permanent changes to base file only if required for all users. for changes for individual user use jade.
// we need sockets.io when we want change a page for a user even though he didnt made any request. for eg message is diplayed to connected users even though they did not send any req. By http server we can only respond when there is a request, but with sockets.io we can also respond when there is no request from the user.



var userinfo=[];
var server=http.createServer(function (req,res){
	var uri=req.url;
	var filepath=url.parse(uri).pathname;
	filepath=path.join(process.cwd(),unescape(filepath));
	console.log("loading - ",uri);
	var stats;
	var requestid=url.parse(uri).pathname.split("/").reverse()[0];
	
	var check=false;
	for (i = 0; i < userinfo.length; i++){
		if((userinfo[i])[1]==requestid) check=true;
	}
	
	

	if(check){
		res.writeHead(200, {"Content-Type": "text/html"});
		var readStream=fs.createReadStream("./message.html");
		readStream.pipe(res);	
	}

	else{
		try{
			stats=fs.lstatSync(filepath);
		}
		catch(e){
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 File Not Found");
			res.end();
			return;                                             //since there is an error no need to execute further just return
		}
		if(stats.isFile()){
			var f="message.html"
			if(filepath==path.join(process.cwd(),f)){
				
				res.writeHead(302, {"Content-Type": "text/html","Location": "./index.html"});
				res.end();
			
			}
			else{
				var mimeType= mimeTypes[path.extname(filepath).split(".").reverse()[0]];
				res.writeHead(200, {"Content-Type": mimeType});
				var readStream=fs.createReadStream(filepath);
				readStream.pipe(res);
			}
		}
		else if(stats.isDirectory()){

			var newfilepath="."+url.parse(uri).pathname;
			newfilepath=path.join(newfilepath,'index.html');
			res.writeHead(302, {"Content-Type": "text/html","Location": newfilepath});		
			res.end();	
		}
		else {
			res.writeHead(500, {"Content-Type": "text/plain"});
			res.write("500 Internal Error\n");
			res.end();
		}
	}	

}).listen(process.env.PORT || 8080);


//socket should be below server otherwise will not work	
var io=require('socket.io').listen(server);
var usernme;
io.sockets.on('connection',function(socket){                  //we have on a event for all sockets and taken one socket connection and performing operation on it//io.sockets is for all sockets (users) and socket is for a paricular user
	socket.on('new user',function(data,callback){
		usernme=data;
		var flag='t';
		for (i=0;i<userinfo.length;i++){
			if((userinfo[i])[0]==data)flag='f';
		}
		
		if(flag=='f'){									//if false show error msg only to that partiular user, not all users, so send username already taken event to that particular user				
			callback(['f','-1']);                 // this event will be  fired for only that user
		}
		else if(flag=='t'){
			var ar=[];
			ar.push(data);
			ar.push(socket.id);
			ar.push('0');
			userinfo.push(ar);
			
			callback(['t',socket.id]);
		}
	});
	socket.on('updatelistnow',function(callback){
		for(j=0;j<userinfo.length;j++){
			if((userinfo[j])[0]==usernme) (userinfo[j])[1]=socket.id;
		}

		callback(usernme);
		io.sockets.emit('update userlist',userinfo);
	});
	socket.on('send message',function(data){
		io.sockets.emit('new message',data);
	});
	
	socket.on('disconnect',function(data){
		
		var i=-1;
		for(j=0;j<userinfo.length;j++){
			if((userinfo[j])[1]==socket.id) i=j;
		}
		
		if(i==-1){}
		else if((userinfo[i])[2]=='0'){
			(userinfo[i])[2]='1';
		}
		else{
			userinfo.splice(i,1);
			io.sockets.emit('update userlist',userinfo);
		}
	});
});