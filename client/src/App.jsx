import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Approutes from './routes/Approutes';
import { AuthProvider } from './Context/AuthContext';
import { UnreadMessagesProvider } from './Context/UnreadMessagesContext';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './Components/ScrollToTop';

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <UnreadMessagesProvider>
          <Approutes />
        </UnreadMessagesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;