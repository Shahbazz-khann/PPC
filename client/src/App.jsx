import { BrowserRouter } from 'react-router-dom';
import Approutes from './routes/Approutes';
import { AuthProvider } from './Context/AuthContext';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Approutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;