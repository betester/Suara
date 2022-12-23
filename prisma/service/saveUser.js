const { prisma } = require("../index");

const saveUser = async (userId, newTimeSpent) => {
    try {
      let user = await prisma.user.findFirst({
        where: {
          username: userId,
        },
      });
  
      if (!user)
        await prisma.user.create({
          data: {
            username: userId,
            timeSpent: newTimeSpent,
          },
        });
      else {
        await prisma.user.update({
          where: {
            username: userId,
          },
          data: {
            timeSpent: user.timeSpent + newTimeSpent,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

exports.saveUser = saveUser;