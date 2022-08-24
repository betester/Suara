exports.run = (client,message,args) => {
    
    message.channel.bulkDelete(args[0]).catch(console.error);
}

exports.name = "deleteMessages";