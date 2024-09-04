export default function App() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white p-20">
      <h1 className="text-4xl font-bold mb-10">MauPlagio</h1>
      <div className="flex gap-10 flex-col xl:flex-row">
        <textarea
          placeholder="Search..."
          className="p-4 xl:w-[400px] w-[350px] h-[300px] bg-slate-800 rounded-xl border-slate-500 border-2"
        />
        <textarea
          placeholder="Search..."
          className="p-4 xl:w-[400px] w-[350px] h-[300px] bg-slate-800 rounded-xl border-slate-500 border-2"
        />
      </div>
      <button className="bg-green-600 p-4 rounded-xl text-white mt-10 w-[300px]">
        Será que tem plagio 😎😎😎
      </button>
    </div>
  );
}
