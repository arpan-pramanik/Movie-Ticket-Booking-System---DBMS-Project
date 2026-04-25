ALTER TABLE Movies ADD COLUMN poster_url VARCHAR(500);

UPDATE Movies SET poster_url = 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg' WHERE movie_id = 1;
UPDATE Movies SET poster_url = 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p10543523_p_v8_as.jpg' WHERE movie_id = 2;
UPDATE Movies SET poster_url = 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg' WHERE movie_id = 3;
UPDATE Movies SET poster_url = 'https://m.media-amazon.com/images/I/81-rG+CAzuL._AC_UF894,1000_QL80_.jpg' WHERE movie_id = 4;
UPDATE Movies SET poster_url = 'https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 5;
UPDATE Movies SET poster_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ07FsMbdqh6L1BjaAYnJWJMKST9OlJvVTvtA&s' WHERE movie_id = 6;
UPDATE Movies SET poster_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6j7Ljof_xzTZFEWtvZ9XHIYlGp8VrNRIRTQ&s' WHERE movie_id = 7;
UPDATE Movies SET poster_url = 'https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 8;
UPDATE Movies SET poster_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk_BlZjGW7iLWajhgJwlKLj5hsgXi5HfWw5A&s' WHERE movie_id = 9;
UPDATE Movies SET poster_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHq6AmwlT9Oy-gGQ2vkml7t-fIkjeuGD11oQ&s' WHERE movie_id = 10;
UPDATE Movies SET poster_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmGeNJMCoGWb8wLhzvPk2WZ2kxD-4rJVvXmA&s' WHERE movie_id = 11;
UPDATE Movies SET poster_url = 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_FMjpg_UX1000_.jpg' WHERE movie_id = 12;
