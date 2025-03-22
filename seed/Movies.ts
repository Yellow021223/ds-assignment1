import { Movie } from "../shared/type";
import { createMovie } from "../shared/util";

export const Movies: Movie[] = [
    createMovie({
        movieId: 'mv001',
        title: 'love and peace', 
        description: "against war",
        watched: true,
        rating: 5, 
    }),
    createMovie({
        movieId: 'mv002',
        title: 'Iron man', 
        description: "super hero",
        watched: false,
        rating: 7, 
    }),
]
