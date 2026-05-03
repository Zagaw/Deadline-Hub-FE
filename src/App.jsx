import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="flex h-screen bg-blue-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">U</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-black text-slate-900">12</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Upcoming Deadlines</h3>
            <p className="text-3xl font-black text-rose-500">05</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Tasks Completed</h3>
            <p className="text-3xl font-black text-green-600">24</p>
          </div>
        </div>
      </main>
    </div>
  );
}
export default App;