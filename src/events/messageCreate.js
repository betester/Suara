module.exports = (client, message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(client.config.prefix)) return;

  const args = message.content
    .slice(client.config.prefix.length)
    .trim()
    .split(/ +/g);


  const commandName = args.shift().toLowerCase();
  console.log(commandName)
  const command = client.commands.get(commandName);


  if (!command) return;

  command.run(client, message, args);
};
