import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import NavElement from './NavElement';

interface SidebarProps {
    activeItem: number;
    onNavClick: (id: number) => void;
}

function Sidebar({ activeItem, onNavClick }: SidebarProps) {
    const navItems = [
        { id: 0, label: "Dashboard", icon: <DashboardIcon style={{ fontSize: "2rem", color: "black", opacity: .7 }} /> },
        { id: 1, label: "Utenti", icon: <PersonIcon style={{ fontSize: "2rem", color: "black", opacity: .7 }} /> },
    ];

    return (
        <aside className="w-64 bg-white flex flex-col py-4 flex-shrink-0">
            <div className="logo-section px-6 mb-8">
                <h2 className="text-2xl font-bold">FakeDash</h2>
            </div>

            <nav className="flex-1 relative overflow-y-auto overflow-x-hidden">
                <div
                    className="absolute left-0 w-[80%] bg-[#F1F1F1] transition-all duration-500 rounded-tr-2xl rounded-br-2xl"
                    style={{
                        height: '64px',
                        top: `${activeItem * 64}px`,
                        zIndex: 0
                    }}
                />
                <ul className="flex flex-col list-none p-0 m-0">
                    {navItems.map((item) => (
                        <NavElement
                            key={item.id}
                            active={activeItem === item.id}
                            onClick={() => onNavClick(item.id)}
                        >
                            {item.icon}
                            <span className="text-lg font-medium">{item.label}</span>
                        </NavElement>
                    ))}
                </ul>
            </nav>

            <div className="mt-4 mx-4 p-4 flex gap-2 bg-black/5 rounded-2xl flex-shrink-0">
                <div className="profile-picture rounded-full bg-black/10 min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                    <PersonIcon style={{ fontSize: "2.5rem", color: "black", opacity: .5 }} />
                </div>
                <div className="h-12 flex flex-col truncate">
                    <div className="truncate font-semibold">Admin User</div>
                    <div className="text-sm text-red-700 cursor-pointer">Disconnetti</div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;