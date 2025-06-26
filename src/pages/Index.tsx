// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('auth') === 'true') {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate]);
  return null;
};

export default Index;
