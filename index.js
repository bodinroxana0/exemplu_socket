var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const ENDPOINT="https://localhost:3000" ;//"https://comunitate.netlify.app"; 
app.get('/', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', ENDPOINT);
console.log("here");
});
app.use(
  cors({
    origin: ENDPOINT,
    credentials: true,
  }));
io.on('connection', function (socket) {
    socket.on('join', ({name,room}, callback) => {
		const {error, user}=addUser({id:socket.id,name,room});
		if(error) return callback(error);
		console.log(room,user);
		socket.join(room);
		callback();
    });
	socket.on('sendmessage',(message,time,callback) =>{
		const user=getUser(socket.id);
		console.log(time);
		if(user.room)
			io.to(user.room).emit('message',{user:user.name,text:message,sendingtime:time});
		else
			console.log("re-enter room");
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