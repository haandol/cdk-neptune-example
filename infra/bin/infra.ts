#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NeptuneClusterStack } from '../lib/stacks/neptune-stack';
import { VpcStack } from '../lib/stacks/vpc-stack';
import { Config } from '../config/loader';

const app = new cdk.App({
  context: {
    ns: Config.app.ns,
    stage: Config.app.stage,
  },
});

const vpcStack = new VpcStack(app, `${Config.app.ns}VpcStack`, {
  vpcId: Config.vpc?.id,
});

const clusterStack = new NeptuneClusterStack(
  app,
  `${Config.app.ns}NeptuneClusterStack`,
  { vpc: vpcStack.vpc }
);
clusterStack.addDependency(vpcStack);

const tags = cdk.Tags.of(app);
tags.add('namespace', Config.app.ns);
tags.add('stage', Config.app.stage);
