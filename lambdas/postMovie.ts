import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { createMovie } from '../shared/util'; 
import { CreateMovieInput } from '../shared/type';

const dynamo = new DynamoDB.DocumentClient(); 
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body!);
    const input: CreateMovieInput = body; 
    console.log("Request body:", input);

    const movie = createMovie(input);
    console.log("movie:", input);

    await dynamo.put({
      TableName: TABLE_NAME,
      Item: movie,
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Movie added!', movieId: movie.movieId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not add Movie', detail: (error as Error).message }),
    };
  }
};