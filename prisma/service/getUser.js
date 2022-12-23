const { prisma } = require("../index");
const { saveUser } = require("./saveUser");
const getUser = async (userId) => {
  let user = await prisma.user.findFirst({ where: { username: userId } });
  if (!user) {
    await saveUser(userId, 0);
  }
  return await prisma.user.findFirst({ where: { username: userId } });
};

exports.getUser = getUser;
