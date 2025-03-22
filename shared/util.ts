import { Movie, CreateMovieInput } from './type';
import { DynamoDB } from 'aws-sdk';


export function createMovie(input: CreateMovieInput): Movie {
  return {
    movieId: input.movieId,
    title: input.title,
    description: input.description,
    watched: input.watched ?? false, 
    rating: input.rating ?? undefined,
    translations: { en: input.description },
  };
}


export function generateBatch(movies: Movie[]): DynamoDB.Types.WriteRequests {
  return movies.map((b) => {
    const item = convertToDynamoFormat(b);
    return {
      PutRequest: { Item: item },
    };
  });
}

function convertToDynamoFormat(movie: Movie): DynamoDB.AttributeMap {
  return DynamoDB.Converter.marshall(movie);
}