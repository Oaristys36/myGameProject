import './styles/style.css';
import {Routes, Route} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenusPage from './pages/MenusPage';
import { RecoveryPage } from './pages/RecoveryPage';

export default function App(){
  return(
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/RegisterPage" element={<RegisterPage/>} />
      <Route path="/MenusPage" element={<MenusPage/>} />
      <Route path="/RecoveryPage" element={<RecoveryPage/>} />
    </Routes>
  );
}


