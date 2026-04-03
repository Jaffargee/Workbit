
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace/index';
import PostJob from './pages/PostJob';
import Wallet from './pages/Wallet';
import Referrals from './pages/Referrals';
import ReviewProofs from './pages/ReviewProofs';
import Subscription from './pages/Subscription';
import Auth from './pages/Auth';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Verified from './pages/Auth/Verified';
import AuthProvider from './context/authentication';
import ProtectedRoutes from './context/protected_routes';
import Profile from './pages/Profile';
import Job from './pages/Marketplace/Job';

const RenderPageComponent = ({ currentPage, element }: { currentPage: string, element: React.ReactNode }) => {
      return (
            <Layout currentPage={currentPage.replace('/', '')}>
                  {element}
            </Layout>
      )
}

const App: React.FC = () => {

      return (
            <AuthProvider>
                  <AppProvider>
                        <Routes>
                              <Route index path='/' element={<LandingPage />} />
                              <Route path='/auth/login' element={<Auth type='login' />} />
                              <Route path='/auth/signup' element={<Auth type='register' />} />
                              <Route path='/auth/workbit/email/verified' element={<Verified />} />
                              <Route path='/dashboard' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/dashboard' element={<Dashboard onPageChange={() => {}} />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/marketplace' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/marketplace' element={<Marketplace />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/marketplace/:job_id' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/marketplace/:job_id' element={<Job />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/postjob' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/postjob' element={<PostJob />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/referrals' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/referrals' element={<Referrals />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/review' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/review' element={<ReviewProofs />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/subscription' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/subscription' element={<Subscription />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/wallet' element={
                                    <ProtectedRoutes>
                                          <RenderPageComponent currentPage='/wallet' element={<Wallet />} />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/auth/setup-profile' element={
                                    <ProtectedRoutes requiredProfileComplete={false}>
                                          <Auth type='profile' />
                                    </ProtectedRoutes>
                              } />
                              <Route path='/profile' element={
                                    <ProtectedRoutes requiredProfileComplete={true}>
                                          <RenderPageComponent currentPage='/profile' element={<Profile />} />
                                    </ProtectedRoutes>
                              } />
                        </Routes>
                  </AppProvider>
            </AuthProvider>
      );
};

export default App;
