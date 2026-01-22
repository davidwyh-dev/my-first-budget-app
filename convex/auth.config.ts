// The SITE_URL environment variable must be set in each Convex deployment:
// Dev:  npx convex env set SITE_URL https://pastel-clownfish-426.convex.site
// Prod: npx convex env set SITE_URL https://efficient-hound-679.convex.site --prod
export default {
  providers: [
    {
      domain: process.env.SITE_URL,
      applicationID: "convex",
    },
  ],
};
