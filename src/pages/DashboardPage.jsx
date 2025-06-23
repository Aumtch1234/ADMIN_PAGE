import Navbar from '../components/Navbar';


function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded shadow w-80">
          <h2 className="text-xl font-bold mb-4">Dashboard</h2>
          <p>Welcome to the admin dashboard!</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
