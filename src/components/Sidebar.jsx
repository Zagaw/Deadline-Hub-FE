/*
const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-slate-900 text-white p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-10 text-purple-400">Deadline Hub</h2>
      <nav>
        <ul className="space-y-4 font-medium">
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-all">
            <span>🏠</span> <span>Dashboard</span>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-all text-slate-400">
            <span>📚</span> <span>My Courses</span>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-all text-slate-400">
            <span>📅</span> <span>Schedule</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};
export default Sidebar;
*/

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-slate-900 text-white p-7">
      <h2 className="text-2xl font-bold mb-10 text-blue-400">Deadline Hub</h2>
      <ul className="space-y-4 font-medium">
        <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">🏠 Dashboard</li>
        <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">📚 My Courses</li>
        <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">📅 Schedule</li>
        <li className="hover:bg-slate-800 p-2 rounded cursor-pointer">⚙️ Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;