const { prisma } = require("../index");
const getUser = async (userId) => {
  return await prisma.user.findFirst({ where: { username: userId } });
};

exports.getUser = getUser;
