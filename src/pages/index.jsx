import Layout from "./Layout.jsx";

import TruckGallery from "./TruckGallery";

import AddTruck from "./AddTruck";

import TruckDetails from "./TruckDetails";

import AdminDashboard from "./AdminDashboard";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    TruckGallery: TruckGallery,
    
    AddTruck: AddTruck,
    
    TruckDetails: TruckDetails,
    
    AdminDashboard: AdminDashboard,
    
    Login: Login,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Routes>            
            <Route path="/login" element={<Login />} />
            
            <Route path="/*" element={
                <Layout currentPageName={currentPage}>
                    <Routes>            
                        <Route path="/" element={<TruckGallery />} />
                        
                        <Route path="/TruckGallery" element={<TruckGallery />} />
                        
                        <Route path="/AddTruck" element={<AddTruck />} />
                        
                        <Route path="/TruckDetails" element={<TruckDetails />} />
                        
                        <Route path="/AdminDashboard" element={<AdminDashboard />} />
                        
                    </Routes>
                </Layout>
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}