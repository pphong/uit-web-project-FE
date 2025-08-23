import { Link } from "react-router-dom";
import { useAuth } from "./contexts";

function App() {
  const [state, dispatch] = useAuth();

  console.log(state);

  return (
    <div className="App" style={{ padding: 20 }}>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
      <div>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Obcaecati,
          nostrum?
        </p>
      </div>
    </div>
  );
}

export default App;
