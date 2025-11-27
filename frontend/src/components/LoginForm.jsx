import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StreamContext } from '../context/StreamContext.jsx';

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { setUser } = useContext(StreamContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      setUser({ _id: res.data.user._id, username: res.data.user.username });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '50px auto' }}>
      <h2>Login</h2>
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} type="email" required />
      <input name="password" placeholder="Password" value={form.password} onChange={handleChange} type="password" required />
      <button type="submit" style={{ marginTop: '10px' }}>Login</button>
    </form>
  );
};

export default LoginForm;
