import * as cdk from 'aws-cdk-lib';
import * as path from 'path'
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as appscaling from 'aws-cdk-lib/aws-applicationautoscaling'

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, 'MyVpc', { maxAzs: 1 });
    const cluster = new ecs.Cluster(this, 'ecscluster', { vpc });
    
    const logDriver = new ecs.AwsLogDriver({
      streamPrefix: "pyapp",
    })

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'taskdef', {
      cpu: 2048,
      memoryLimitMiB: 8192,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },
    })

    taskDefinition.addContainer('container', {
      image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, '../..')),
      // secrets: {}
      environment: {
        greeting: "fargate"
      },
    })


    const scheduledFargateTask = new ecs_patterns.ScheduledFargateTask(this, 'ScheduledFargateTask', {
      cluster,
      scheduledFargateTaskImageOptions: {
        taskDefinition,
        image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, '../..')),
        // secrets: {}
        environment: {
          greeting: "fargate"
        },
        logDriver
      },
      schedule: appscaling.Schedule.expression('rate(2 minutes)'),
      tags: [
        {
          key: 'Name',
          value: 'pyapp',
        },
      ],
    });


  }
}
