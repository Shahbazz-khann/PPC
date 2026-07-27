import { BrowserRouter } from 'react-router-dom';
import Approutes from './routes/Approutes';

const App = () => {
  return (
    <BrowserRouter>
      <Approutes />
    </BrowserRouter>
  );
};

export default App;