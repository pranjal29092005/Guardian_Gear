import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import KanbanBoard from './pages/KanbanBoard';
import CalendarView from './pages/CalendarView';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Teams from './pages/Teams';
import WorkCenters from './pages/WorkCenters';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SidebarProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />

                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/equipment"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <EquipmentList />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/equipment/:id"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <EquipmentDetail />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/kanban"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <KanbanBoard />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/calendar"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <CalendarView />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/reports"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Reports />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/categories"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Categories />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/teams"
                                element={                                  <ProtectedRoute>
                                <Layout>
                                    <Teams />
                                </Layout>
                            </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/workcenters"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <WorkCenters />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Settings />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Router>
                </SidebarProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
