const getChannel = async (client, channelId) => {
  try {
    return await client.channels.fetch(channelId);
  } catch (e) {
    // TODO: handle error
  }
};

exports.getChannel = getChannel;
