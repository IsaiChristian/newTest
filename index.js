import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
app.use(                //this mean we don't need to use body-parser anymore
    express.urlencoded({
        extended: false,
    }))
app.use(express.json());

const port = 3000

app.get('/', (req, res) => {
    res.send('Poke busqeda!')
})

// curl -X POST -H "Content-Type: application/json" -d '{"data":"{'type':'programmer'}"}' http://localhost:3000/pokemon/create/charmanchristo
app.post('/pokemon/create/:pokeName', async (req, res) => {

    try {
        const { pokeName } = req.params;
        const data = req.body;
        console.log(data)
        // Create the new Pokemon
        const newPokemon = await prisma.pokemon.create({

            data: {
                name: pokeName,
                data: JSON.stringify(data),

            },
        });
        console.log(newPokemon)
        res.status(201).json({ message: 'Pokemon creado', newPokemon });
    } catch (error) {
        res.status(500).json({ error: 'Algo salio mal ' + error });
    }
});
// curl -X GET http://localhost:3000/pokemon/{NOMBRE}
app.get('/pokemon/:pokeName', async (req, res) => {
    const { pokeName } = req.params;
    let pokemon = await prisma.pokemon.findUnique({
        where: {
            name: pokeName,
        },
    });

    if (!pokemon) {
        console.log('Pokemon no encontrado');
        try {
            const { pokeName } = req.params;
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/` + pokeName);
            const data = await response.json();
            const poke = await prisma.pokemon.create({
                data: {
                    name: req.params.pokeName,
                    data: JSON.stringify(data)

                },
            })
            console.log("pokemon Salvado  " + poke.name)
            res.json(poke)
        } catch (error) {
            console.error('Error salvando al pokemon:', error);
            return res.status(404).json({ message: 'Pokemon no encontrado' });
        }
    } else {
        res.json(pokemon)
    }



})

// curl -X PUT -H "Content-Type: application/json" -d '{"name":"nuevoNombre","data":"{'type':'programmer'}"}' http://localhost:3000/pokemon/update/{viejoonombre}
app.put('/pokemon/update/:pokeName', async (req, res) => {
    try {
        const { pokeName } = req.params;
        const { updatedDetails } = req.body; // Object containing updated details

        // Find the Pokémon by name
        let pokemon = await prisma.pokemon.findUnique({
            where: {
                name: pokeName,
            },
        });

        if (!pokemon) {
            return res.status(404).json({ message: 'Pokemon no encontrado' });
        }


        console.log("resquest es : ", req.body)

        const newDetails = JSON.stringify(req.body)

        console.log("nuevos ", newDetails);

        pokemon = await prisma.pokemon.update({
            where: {
                name: pokeName,
            },
            data:
            {
                name: req.body["name"],
                data: req.body["data"],
            }


            , // Update with the provided details
        });
        console.log(pokemon.name);
        res.status(200).json({ message: 'Pokemon actualizado', updatedPokemon: pokemon.name });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error ' + error });
    }
});
// curl -X DELETE http://localhost:3000/pokemon/delete/nuevopoke
app.delete('/pokemon/delete/:pokeName', async (req, res) => {

    try {
        const { pokeName } = req.params;

        // Find the Pokémon by name
        const pokemon = await prisma.pokemon.findFirst({
            where: {
                name: pokeName,
            },
        });

        if (!pokemon) {
            return res.status(404).json({ message: 'Pokemon no encontrado' });
        }

        // Delete the Pokemon
        await prisma.pokemon.delete({
            where: {
                id: pokemon.id
            },
        });

        res.status(200).json({ message: 'Pokemon borrado' });
    } catch (error) {
        res.status(500).json({ error: error + 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`PokeServer listening on port ${port}`)
})