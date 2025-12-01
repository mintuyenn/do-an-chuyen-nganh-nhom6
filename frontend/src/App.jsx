import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { CartProvider } from "./context/CartContext.jsx";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
