import { APIGatewayProxyHandler } from 'aws-lambda'; 
import { DynamoDB } from 'aws-sdk'; 

const dynamo = new DynamoDB.DocumentClient(); 
const TABLE_NAME = process.env.TABLE_NAME!; 

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const movieId = event.pathParameters?.movieId; 

    if (!movieId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing MovieId in path' }),
      };
    }

    const result = await dynamo.scan({
      TableName: TABLE_NAME,
      FilterExpression: 'movieId = :bid',
      ExpressionAttributeValues: {
        ':bid': movieId,
      },
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Movie not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items), 
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Movie', detail: (err as Error).message }),
    };
  }
};