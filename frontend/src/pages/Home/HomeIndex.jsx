import React from 'react';
import { Outlet } from 'react-router-dom';

function HomeIndex() {
  return (
    <div className="w-full min-h-screen">
      <Outlet />
    </div>
  );
}

export default HomeIndex;