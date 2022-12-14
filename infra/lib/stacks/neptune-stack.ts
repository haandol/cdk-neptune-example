import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sm from 'aws-cdk-lib/aws-sagemaker';
import * as neptune from '@aws-cdk/aws-neptune-alpha';

interface IProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class NeptuneClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    const ns = this.node.tryGetContext('ns') as string;

    const securityGroup = new ec2.SecurityGroup(this, 'NeptuneSecurityGroup', {
      securityGroupName: `${ns}Neptune`,
      vpc: props.vpc,
    });

    const subnetGroup = new neptune.SubnetGroup(this, 'NeptuneSubnetGroup', {
      subnetGroupName: `${ns.toLowerCase()}-neptune-subnet-group`,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    const cluster = new neptune.DatabaseCluster(this, 'NeptuneCluster', {
      dbClusterName: `${ns.toLowerCase()}-neptune-cluster`,
      vpc: props.vpc,
      subnetGroup,
      securityGroups: [securityGroup],
      engineVersion: new neptune.EngineVersion('1.2.0.2'),
      instanceType: neptune.InstanceType.R5_XLARGE,
      autoMinorVersionUpgrade: true,
      parameterGroup: neptune.ParameterGroup.fromParameterGroupName(
        this,
        'ParameterGroup',
        'default.neptune1.2'
      ),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    cluster.connections.allowFrom(
      securityGroup,
      ec2.Port.tcp(8182),
      'Allow traffic from Neptune Security Group'
    );

    const smRole = new iam.Role(this, 'SagemakerRole', {
      roleName: `AWSNeptuneNotebookRole${ns}`,
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
    });
    new sm.CfnNotebookInstance(this, 'NotebookInstance', {
      notebookInstanceName: `aws-neptune-${ns.toLowerCase()}`,
      instanceType: 'ml.t3.medium',
      roleArn: smRole.roleArn,
      securityGroupIds: [securityGroup.securityGroupId],
      platformIdentifier: 'notebook-al2-v2',
      directInternetAccess: 'Enabled',
      subnetId: props.vpc.privateSubnets[0].subnetId,
      volumeSizeInGb: 64,
    });
  }
}
