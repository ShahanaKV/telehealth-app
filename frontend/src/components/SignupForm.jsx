import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StreamContext } from '../context/StreamContext.jsx';

const SignupForm = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();
  const { setUser } = useContext(StreamContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', form);
      // Automatically log in after signup
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: form.email,
        password: form.password,
      });
      setUser({ _id: loginRes.data.user._id, username: loginRes.data.user.username });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '50px auto' }}>
      <h2>Signup</h2>
      <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} type="email" required />
      <input name="password" placeholder="Password" value={form.password} onChange={handleChange} type="password" required />
      <button type="submit" style={{ marginTop: '10px' }}>Signup</button>
    </form>
  );
};

export default SignupForm;
