import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const EditorLayout = () => {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Header />
            <main className="grow overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};

export default EditorLayout;
