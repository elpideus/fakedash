import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar.tsx";
import PostListContent from "../components/PostListContent.tsx";
import UserListContent from "../components/UserListContent.tsx";
import Post from "./Post.tsx";
import type {MRT_PaginationState} from "material-react-table";

function DashboardPage() {
    /** Sets the currently active sidebar menu option */
    const [currentlyActive, setCurrentlyActive] = useState(0);

    /** Sets the Material React Table page to the first one (0) and the max elements per page to 10 */
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    /** Used for routing */
    const navigate = useNavigate();
    /** Used for routing */
    const location = useLocation();

    /** Checks that we are on a post's page */
    const isPostDetailPage = location.pathname.startsWith('/post/');

    /** Handles sidebar menu options clicks */
    function handleNavClick(id: number) {
        setCurrentlyActive(id);
        switch(id) {
            case 0:
                navigate('/');
                break;
            case 1:
                navigate('/users');
                break;
            default:
                navigate('/');
        }
    }

    return (
        <div className="flex h-screen w-full bg-[#F1F1F1] font-sans overflow-hidden">
            <Sidebar activeItem={currentlyActive} onNavClick={handleNavClick} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Routes>
                    <Route index element={
                        <PostListContent
                            pagination={pagination}
                            onPaginationChange={setPagination}
                            isPostDetailPage={isPostDetailPage}
                        />
                    } />
                    <Route path="post/:postId" element={<Post />} />
                    <Route path="users" element={<UserListContent />} />
                    <Route path="dashboard" element={<div className="p-8">Dashboard Content</div>} />
                    {/* Catch-all route for any unmatched paths */}
                    {/* TODO: Add a 404 route for unmatched paths */}
                    <Route path="*" element={
                        <PostListContent
                            pagination={pagination}
                            onPaginationChange={setPagination}
                            isPostDetailPage={isPostDetailPage}
                        />
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default DashboardPage;