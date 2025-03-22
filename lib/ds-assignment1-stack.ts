import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as custom from 'aws-cdk-lib/custom-resources'

export class DsAssignment1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'MoviesTable',{
      partitionKey: {name:"movieId", type:dynamodb.AttributeType.STRING },
      sortKey:{name:"title", type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName:'Movies',
    });

    //创建post用于添加电影
    const postMovieFn = new lambdanode.NodejsFunction(this, 'PostMoviesFunction', {
      runtime:lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      entry: `${__dirname}/../lambdas/postMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize:128,
      environment:{
        TABLE_NAME: table.tableName,
        REGION: 'eu-west-1'
      }
    })

    //赋予权限
    table.grantWriteData(postMovieFn);

    //创建API权限管理
    const api = new apig.RestApi(this, 'MoviesApi', {
      restApiName: "Movies Service",
      description: 'movies Api',
      deployOptions:{
        stageName:"dev",
      },
      defaultCorsPreflightOptions:{
        allowHeaders: ["Content-Type","X-Api-Key"],
        allowMethods: ["OPTONS","GET", "PUT", "PATCH", "DELETE","POST"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
      apiKeySourceType: apig.ApiKeySourceType.HEADER,
    })

    //创建 API Key
    const apiKey = api.addApiKey('MoviesApiKey');

    //创建使用计划
    const plan = api.addUsagePlan("UsagePlan",{
      name: 'BasicUsagePlan',
      throttle: { rateLimit: 10, burstLimit: 2 },
    })

    plan.addApiStage({ stage: api.deploymentStage });

    plan.addApiKey(apiKey);

    const movies = api.root.addResource('movies');

    movies.addMethod('POST', new apig.LambdaIntegration(postMovieFn),{
      apiKeyRequired: true,
    });

  }
}
