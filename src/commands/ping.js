exports.run = (client,message,args) => {
    try {
    message.channel.send("Pong!").catch(console.error);
    }
    catch {
        
    }
}

exports.name = "ping";