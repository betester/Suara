exports.run = (client,message,args) => {
    console.log(message)
    message.channel.bulkDelete(args[0]).catch(console.error);
}

exports.name = "deleteMessages";