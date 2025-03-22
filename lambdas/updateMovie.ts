import { APIGatewayProxyHandler } from 'aws-lambda'; 
import { DynamoDB } from 'aws-sdk'; 

const dynamo = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}'); 
    const { movieId, title, ...fieldsToUpdate } = body; 
    if (!movieId || !title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing movieId or title in request body' }),
      };
    }

    const updateParts: string[] = []; 
    const expressionAttributeNames: Record<string, string> = {}; 
    const expressionAttributeValues: Record<string, any> = {}; 

    let index = 0;
    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      const nameKey = `#key${index}`;
      const valueKey = `:val${index}`;
      updateParts.push(`${nameKey} = ${valueKey}`); 
      expressionAttributeNames[nameKey] = key; 
      expressionAttributeValues[valueKey] = value; 
      index++;
    }

    if (updateParts.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No fields provided to update' }),
      };
    }

    const result = await dynamo.update({
      TableName: TABLE_NAME, 
      Key: { movieId, title }, 
      UpdateExpression: `set ${updateParts.join(', ')}`, 
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW', 
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Movie updated', updatedItem: result.Attributes }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update movie', detail: (err as Error).message}),
    };
  }
};