import { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress
} from '@mui/material';
import {SecondaryButton} from "../components/Buttons.tsx";

/** Interface that defines the Post data structure */
interface Post {
    id: string | number;
    userId: string | number;
    title: string;
    content: string;
    createdAt: string;
}

/** Interface that defines the User data structure in relation to the Post */
interface User {
    id: string | number;
    name: string;
}

function PostDetails() {
    /** Gets the post ID from the parameters */
    const { postId } = useParams<{ postId: string }>();
    /** Used for routing */
    const navigate = useNavigate();
    /** Get the 'from' parameter from URL to know where to go back */
    const [searchParams] = useSearchParams();
    const from = searchParams.get('from') || '/';
    /** We use TanStack Query for...well...querying the data */
    const queryClient = useQueryClient();
    /** State that determines if the post is being edited or not */
    const [isEditing, setIsEditing] = useState(false);
    /** State containing the edited contents of the post */
    const [editedPost, setEditedPost] = useState<Post | null>(null);
    /** Deleting post state */
    const [isDeleting, setIsDeleting] = useState(false);
    /** State for delete confirmation dialog */
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const decodedFrom = from ? decodeURIComponent(from) : '/';

    /** Fetches post data from API */
    const { data: post, isLoading: postLoading, isError: postError } = useQuery<Post>({
        queryKey: ['post', postId],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/posts?id=${postId}`);
            const postData = res.data[0];
            setEditedPost(postData); /** Initialize edit page with the post's data */
            return postData;
        },
        enabled: !!postId, // Only run if postId exists
    });

    /** Fetches user data from API */
    const { data: user, isLoading: userLoading } = useQuery<User>({
        queryKey: ['user', post?.userId],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/users?id=${post?.userId}`);
            return res.data[0];
        },
        enabled: !!post?.userId,
    });

    /** Opens the delete confirmation dialog */
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    /** Closes the delete confirmation dialog */
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    /** Handles the delete action */
    const handleDelete = () => {
        setDeleteDialogOpen(false);
        setIsDeleting(true);

        // Remove from cache first for immediate UI update
        queryClient.setQueryData(['post', postId], null);

        // Also update the posts list cache
        const postsQueryKey = ['posts', 0, 10];
        const currentPostsData = queryClient.getQueryData(postsQueryKey);
        if (currentPostsData && typeof currentPostsData === 'object' && 'posts' in currentPostsData) {
            const typedData = currentPostsData as { posts: Post[], totalCount: number };
            const updatedPosts = typedData.posts.filter(p => p.id !== postId);
            queryClient.setQueryData(postsQueryKey, {
                posts: updatedPosts,
                totalCount: typedData.totalCount - 1
            });
        }

        // Redirects the user back to the previous page after deletion
        setTimeout(() => {
            navigate(decodedFrom);
        }, 1000);
    };

    /** Handles saving the post */
    function handleSave() {
        if (!editedPost) return;

        // Update cache with edited post
        queryClient.setQueryData(['post', postId], editedPost);

        // Also update in posts list cache
        const postsQueryKey = ['posts', 0, 5];
        const currentPostsData = queryClient.getQueryData(postsQueryKey);

        if (currentPostsData && typeof currentPostsData === 'object' && 'posts' in currentPostsData) {
            const typedData = currentPostsData as { posts: Post[], totalCount: number };
            const updatedPosts = typedData.posts.map(p =>
                p.id === postId ? editedPost : p
            );
            queryClient.setQueryData(postsQueryKey, {
                posts: updatedPosts,
                totalCount: typedData.totalCount
            });
        }

        setIsEditing(false);
    }

    /** Handles canceling the edit */
    function handleCancel() {
        setEditedPost(post || null);
        setIsEditing(false);
    }

    /** Handles double-clicking to enter edit mode */
    const handleDoubleClick = () => {
        if (!isEditing) setIsEditing(true);
    };

    // Format date function
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    // Show loading state
    if (postLoading || isDeleting) {
        return (
            <div className="p-8 h-full flex items-center justify-center">
                <div className="text-center">
                    <CircularProgress size={60} sx={{color: "#4a5565"}} />
                    <p className="mt-4 text-gray-600">
                        {isDeleting ? "Eliminazione del post in corso..." : "Caricamento del post..."}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state (but not when deleting)
    if ((postError && !isDeleting) || (!post && !isDeleting)) {
        return (
            <div className="p-8 h-full">
                <div className="mb-6">
                    <Link
                        to={decodedFrom}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowBackIcon /> Torna alla lista
                    </Link>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-600">
                    <h2 className="text-2xl font-bold mb-4">Errore nel caricamento del post</h2>
                    <p>Impossibile caricare il post. Assicurati che il server sia attivo e che il post esista.</p>
                    <p className="mt-2 text-sm">Post ID: {postId}</p>
                </div>
            </div>
        );
    }

    // Ensure editedPost is initialized
    if (!editedPost && post) setEditedPost(post);

    return (
            <div className="p-8 h-full overflow-auto">
                {/* Back button */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        to={decodedFrom}
                        className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200"
                    >
                        <span className="inline-block transition-transform duration-200 group-hover:-translate-x-2 delay-150">
                            <ArrowBackIcon />
                        </span>
                        <span className="group-hover:scale-110 transition-all duration-200">
                            {from === '/' ? 'Torna alla lista' : 'Torna indietro'}
                        </span>
                    </Link>


                {/* Edit/Delete buttons (only show when not editing) */}
                {/* TODO: Do not show if not logged in */}
                {!isEditing && (
                    <div className="flex gap-2">
                        <IconButton
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                            title="Modifica post"
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleDeleteClick}
                            className="bg-red-100 hover:bg-red-200 text-red-600"
                            title="Elimina post"
                            disabled={isDeleting}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </div>
                )}

                {/* Save/Cancel buttons (only show when editing) */}
                {isEditing && (
                    <div className="flex gap-2">
                        <IconButton
                            onClick={handleSave}
                            className="bg-green-100 hover:bg-green-200 text-green-600"
                            title="Salva modifiche"
                        >
                            <SaveIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleCancel}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                            title="Annulla modifiche"
                        >
                            <CancelIcon />
                        </IconButton>
                    </div>
                )}
            </div>

            {/* Post content */}
            <article
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
                onDoubleClick={handleDoubleClick}
            >
                <header className="mb-8">
                    {isEditing ? (
                        <TextField
                            fullWidth
                            value={editedPost?.title || ''}
                            onChange={(e) => setEditedPost(prev => prev ? {...prev, title: e.target.value} : null)}
                            variant="outlined"
                            className="mb-4"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '2.25rem',
                                    fontWeight: 'bold',
                                }
                            }}
                        />
                    ) : (
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">{editedPost?.title || 'Titolo non disponibile'}</h1>
                    )}
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                            {userLoading ? (
                                <span className="text-gray-400 italic">Caricamento autore...</span>
                            ) : (
                                <Link to={`/user/${user ? user.id : ""}?from=${encodeURIComponent(location.pathname + location.search)}`} className="font-medium">{user ? user.name : `User ${editedPost?.userId || 'non disponibile'}`}</Link>
                            )}
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                                {editedPost?.createdAt ? formatDate(editedPost.createdAt) : 'Data non disponibile'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="prose max-w-none">
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            value={editedPost?.content || ''}
                            onChange={(e) => setEditedPost(prev => prev ? {...prev, content: e.target.value} : null)}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '1.125rem',
                                    lineHeight: '1.75',
                                }
                            }}
                        />
                    ) : (
                        <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
                            {editedPost?.content || 'Contenuto non disponibile'}
                        </p>
                    )}
                </div>

                {/* Edit hint (only show when not editing) */}
                {/* TODO: Do not show if not logged in */}
                {!isEditing && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 italic">
                            Doppio click sul post per attivare la modalità modifica
                        </p>
                    </div>
                )}
            </article>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title" className="font-semibold text-xl">
                    Conferma eliminazione
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description" className="text-gray-700">
                        Sei sicuro di voler eliminare il post "{editedPost?.title}"?
                        Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-6 pt-2">
                    <SecondaryButton onClick={handleCloseDeleteDialog}>Annulla</SecondaryButton>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        autoFocus
                    >
                        Elimina
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default PostDetails;