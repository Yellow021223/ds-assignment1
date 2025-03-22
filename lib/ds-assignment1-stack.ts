import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as custom from 'aws-cdk-lib/custom-resources'
import { generateBatch } from '../shared/util';
import { Movies } from '../seed/Movies';

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

    const getMoviesFn = new lambdanode.NodejsFunction(this, 'GetMoviesFunction', {
      runtime:lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      entry: `${__dirname}/../lambdas/getMovies.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize:128,
      environment:{
        TABLE_NAME: table.tableName,
        REGION: 'eu-west-1'
      }
    })

    const getMovieFn = new lambdanode.NodejsFunction(this, 'GetMovieFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      entry: `${__dirname}/../lambdas/getMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: table.tableName,
        REGION: 'eu-west-1',
      },
    });

    const updateMovieFn = new lambdanode.NodejsFunction(this, 'UpdateMovieFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      entry: `${__dirname}/../lambdas/updateMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: table.tableName,
        REGION: 'eu-west-1',
      },
    });

    table.grantWriteData(postMovieFn);
    table.grantReadData(getMoviesFn);
    table.grantReadData(getMovieFn);
    table.grantWriteData(updateMovieFn);

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

    const apiKey = api.addApiKey('MoviesApiKey');

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

    movies.addMethod('GET', new apig.LambdaIntegration(getMoviesFn),{
      apiKeyRequired: true,
    })

    const MovieById = movies.addResource('movie').addResource('{movieId}');
    MovieById.addMethod('GET', new apig.LambdaIntegration(getMovieFn), {
      apiKeyRequired: true,
    });

    movies.addMethod('PUT',new apig.LambdaIntegration(updateMovieFn),{
      apiKeyRequired: true,
    });

    new custom.AwsCustomResource(this, 'SeedMoviesData', {
      onCreate: {

        service: 'DynamoDB', 
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [table.tableName]: generateBatch(Movies), 
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of('SeedMoviesData'), 
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [table.tableArn],
      }),
    });
  }
}
