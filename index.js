var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
res.sendFile(__dirname + '/index.html');
});
/*io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
 });
});
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
  console.log('message: ' + msg);
});
});*/
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('join', ({name,room}, callback) => {
		const {error, user}=addUser({id:socket.id,name,room});
		if(error) return callback(error);
		console.log(room,user);
		socket.join(room);
		callback();
    });
	socket.on('sendmessage',(message,callback) =>{
		const user=getUser(socket.id);
		console.log(user);
		io.to(user.room).emit('message',{user:user.name,text:message});
	});
	socket.on('disconnect', () => {
    console.log('user disconnected');
 });
});
const users=[];
const addUser=({id,name,room})=>{
	name=name.trim().toLowerCase();
	room=room.trim().toLowerCase();
	const existingUser=users.find((user)=>user.room===room && user.name===name);
	if(existingUser){
		return {error:'Username is taken'};
	}
		const user={id,name,room};
		users.push(user);
	return {user};
}
const getUser=(id)=>users.find((user)=>user.id===id);

//server settings
http.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});