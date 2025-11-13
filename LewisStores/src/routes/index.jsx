import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button"
// import { CustomerNavbar } from "@/components/NavigationMenus/CustomerNavbar";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <header className="bg-red-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-center">Welcome to Lewis E-Commerce</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <p className="mb-8 text-xl font-medium text-gray-600">Shop our latest products!</p>
          <Link to="/catalog">
            <Button>View Catalog</Button>
          </Link>
        </div>
      </main>
      <footer className="bg-red-600 text-white py-4 text-center text-sm">
        <div className="container mx-auto px-4">
          &copy; 2025 Lewis E-Commerce. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
    
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
//       <h1 className="mb-4 text-5xl font-extrabold text-red-600 tracking-tight">Welcome to Lewis E-Commerce</h1>
//       <p className="mb-8 text-xl font-medium text-gray-600">Shop our latest products!</p>
//       {/* <Link to="/catalog">
//         <Button>View Catalog</Button>
//       </Link> */}
//     </div>
//   );
// }
