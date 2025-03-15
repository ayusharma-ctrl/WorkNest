import { SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "WorkNest",
      region: "ap-south-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {

      const site = new NextjsSite(stack, "site", {
        environment: {
          DATABASE_URL: process.env.DATABASE_URL!,
          AUTH_SECRET: process.env.AUTH_SECRET!,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
          AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID!,
          AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET!,
        }
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
