import { useState } from "react"; // Adicionado
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/Login.tsx"; // Importar a nova página

const queryClient = new QueryClient();

const App = () => {
  // Estado para controlar se o utilizador está logado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />

            {/* Rota Protegida: Se não estiver logado, manda para /login */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Index /> : <Navigate to="/login" />} 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;