import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Approutes from './routes/Approutes';
import { AuthProvider } from './Context/AuthContext';
import { useTranslation } from 'react-i18next';

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Approutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;