const {
    client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async (req, res, next) => {
    try {
        res.send(await fetchUsers())
    } catch (ex) {
        next(ex)
    }
});

app.get('/api/products', async (req, res, next) => {
    try {
        res.send(await fetchProducts())
    } catch (ex) {
        next(ex)
    }
});

app.get('/api/users/:user_id/favorites', async (req, res, next) => {
    try {
        res.send(await fetchFavorites(req.params.user_id));
    } catch (ex) {
        next(ex)
    }
});
app.post('/api/users/:user_id/favorites/:product_id', async (req, res, next) => {
    try {
        const result = await createFavorite({
            user_id: req.params.user_id,
            product_id: req.params.product_id});
        res.status(201).send(result);
    } catch (ex) {
        next(ex)
    }
});
app.delete('/api/users/:user_id/favorites/:id', async (req, res, next) => {
    try {
        await destroyFavorite({
            user_id: req.params.user_id,
            id: req.params.id,
        });
        res.sendStatus(204);
    } catch (ex) {
        next(ex)
    }
});

const seed = async () => {
    await createTables();
    console.log('tables created');

    await Promise.all([
        createUser({ username: 'zeel', password: 'zeel@123' }),
        createUser({ username: 'joe', password: 'joe@123' }),
        createUser({ username: 'angel', password: 'angel@123' }),
        createUser({ username: 'john', password: 'john@123' }),
        createUser({ username: 'honey', password: 'honey@123' }),
    ]);
    await Promise.all([
        createProduct({ name: 'milk' }),
        createProduct({ name: 'nuts' }),
        createProduct({ name: 'socks' }),
        createProduct({ name: 'pants' }),
        createProduct({ name: 'shaving cream' }),
        createProduct({ name: 'oil' }),
        createProduct({ name: 'toothpaste' })
    ]);

    const users = await fetchUsers();
    console.log('users created', users);
    const products = await fetchProducts();
    console.log('products created', products);
    await Promise.all([
        createFavorite({
            product_id: products[0].id,
            user_id: users[0].id,
        }),
        createFavorite({
            product_id: products[5].id,
            user_id: users[0].id,
        }),
        createFavorite({
            product_id: products[1].id,
            user_id: users[1].id,
        }),
        createFavorite({
            product_id: products[2].id,
            user_id: users[2].id,
        }),
        createFavorite({
            product_id: products[3].id,
            user_id: users[3].id,
        }),
        createFavorite({
            product_id: products[4].id,
            user_id: users[3].id,
        }),
    ]);
    const favorites = await fetchFavorites(users[3].id);
    console.log('favorties created', favorites);

    //await destroyFavorite(favorites[1].id);
    const favoriteToDelete = favorites[1];
    console.log("Favorite to delete:", favoriteToDelete);
    const result = await destroyFavorite({
        id: favoriteToDelete.id,
        user_id: users[3].id
    });
    console.log(result.message);

    console.log(await fetchFavorites(users[0].id));

}
const init = async () => {
    console.log("Connecting to database");
    await client.connect();

    console.log("Connected to database");
    const db = true;
    if (db == true) {
        seed();
    }
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening to port ${port}`);

    })
}
init();

