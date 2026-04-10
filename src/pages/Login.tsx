import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, User, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo-uenp.png";

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (user === "admin" && pass === "P2bl0&Lu15@0") ||
      (user === "samuel" && pass === "1234")
    ) {
      onLogin();
      toast.success("Acesso autorizado! Bem-vindo.");
      navigate("/");
    } else {
      toast.error("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Lado Esquerdo: Imagem/Logo (Escondido em ecrãs muito pequenos) */}
        <div className="hidden md:flex md:w-1/2 bg-blue-900 p-12 flex-col justify-center items-center text-white text-center space-y-6">
          {/* Substitui o src abaixo pelo caminho da tua imagem da UENP */}
          <img
            src={logo}
            alt="Logo UENP"
            className="w-48 h-auto object-contain mb-4 drop-shadow-lg bg-white rounded-2xl"
          />
          <div>
            <h1 className="text-2xl font-bold">Gestão de Infraestrutura</h1>
            <p className="text-blue-100 mt-2 text-sm">Monitorização de Racks e Conectividade de Centros</p>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="md:hidden flex justify-center mb-6">
            <img src="https://www.uenp.edu.br/images/logo_uenp_vertical.png" alt="UENP" className="h-20" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800">Login</h2>
            <p className="text-slate-500 mt-2">Introduza as suas credenciais de administrador.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User size={16} /> Utilizador
              </label>
              <input
                type="text"
                required
                placeholder="admin"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Lock size={16} /> Palavra-passe
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-md mt-4"
            >
              <ShieldCheck size={20} />
              Entrar no Sistema
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest font-semibold">
            NTI - Campus Jacarezinho
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;