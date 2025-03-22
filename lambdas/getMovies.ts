import { APIGatewayProxyHandler } from 'aws-lambda'; 
import { DynamoDB } from 'aws-sdk'; 

const dynamo = new DynamoDB.DocumentClient(); 
const TABLE_NAME = process.env.TABLE_NAME!; 

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamo.scan({
      TableName: TABLE_NAME, 
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items), 
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch books', detail: (err as Error).message }),
    };
  }
};