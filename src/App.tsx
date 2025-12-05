import PokemonCard from "./components/PokemonCard";


function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">PokeAPI AM</h1>
      </div>
      <PokemonCard />
    </div>
  );
}

export default App;
