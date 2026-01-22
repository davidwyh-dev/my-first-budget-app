import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string | undefined,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // Update existing user with any new profile data
        await ctx.db.patch(args.existingUserId, {
          email: args.profile.email,
          name: args.profile.name,
        });
        return args.existingUserId;
      }
      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
      });
      return userId;
    },
  },
});
