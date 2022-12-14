#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NeptuneClusterStack } from '../lib/stacks/neptune-stack';
import { VpcStack } from '../lib/stacks/vpc-stack';
import { Config } from '../lib/configs/loader';

const app = new cdk.App({
  context: {
    ns: Config.Ns,
  },
});

const vpcStack = new VpcStack(app, `${Config.Ns}VpcStack`, {
  vpcId: Config.VpcId,
  env: {
    account: Config.AWS.Account,
    region: Config.AWS.Region,
  },
});

const clusterStack = new NeptuneClusterStack(
  app,
  `${Config.Ns}NeptuneClusterStack`,
  {
    vpc: vpcStack.vpc,
    env: {
      account: Config.AWS.Account,
      region: Config.AWS.Region,
    },
  }
);
clusterStack.addDependency(vpcStack);

const tags = cdk.Tags.of(app);
tags.add('namespace', Config.Ns);
tags.add('stage', Config.Stage);
