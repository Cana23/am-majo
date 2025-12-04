import { useEffect, useState, useCallback } from "react";

interface Pokemon {
  name: string;
  url: string;
}

const PokemonCard = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPokemons = useCallback(async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=30');
      const data = await response.json();
      setPokemons(data.results || []);
    } catch (error) {
      console.error('Error fetching pokemons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemons();
  }, [fetchPokemons]);

  const onSelect = async (pokemon: Pokemon) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error('Request permission error', err);
      }
    }
    if (Notification.permission === 'granted') {
      new Notification(`Has seleccionado a ${pokemon.name}`, {
        body: 'Pulsa para ver más (demo local).',
      });
    } else {
      console.info('Notification permission not granted');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {pokemons.map((pokemon) => {
        const pokemonId = pokemon.url.split('/').filter(Boolean).pop();
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
        return (
          <button
            key={pokemon.name}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer"
            onClick={() => onSelect(pokemon)}
          >
            <img src={imageUrl} alt={pokemon.name} className="w-24 h-24 mb-2 object-contain" />
            <h2 className="text-lg font-bold capitalize">{pokemon.name}</h2>
          </button>
        );
      })}
    </div>
  );
};

export default PokemonCard;
