// backend/middleware/prismaUser.js
import prisma from "../config/prismaClient.js";

export const withUser = (userId) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Set context.userId so middleware knows who did it
          prisma.$transactionContext.set("userId", userId);
          return query(args);
        },
      },
    },
  });
};
