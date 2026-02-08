import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TextField } from '@mui/material';
import { useDashAPI } from '../context/APIContext.tsx';

// Import shared components and hooks
import { useDeleteConfirmation } from "../hooks/useDeleteConfirmation.ts";
import { useNavigationHelpers } from "../hooks/useNavigationHelpers.ts";
import { formatDate } from "../utils/dateUtils.ts";
import LoadingState from "../components/common/LoadingState.tsx";
import ErrorState from "../components/common/ErrorState.tsx";
import ConfirmationDialog from "../components/common/ConfirmationDialog.tsx";
import DetailPageLayout from "../components/common/DetailPageLayout.tsx";
import HeaderActions from "../components/common/HeaderActions.tsx";
import { useAuth } from "../store/authStore.ts";

// Interface for edited post state
interface EditedPostState {
    id: string;
    userId: number;
    title: string;
    content: string;
    createdAt: string;
}

function PostDetails() {
    const { postId } = useParams<{ postId: string }>();
    const { api, isLoading: apiLoading, error: apiError } = useDashAPI();
    const { navigateBack, navigateToUser, getBackTarget } = useNavigationHelpers();
    const { isAuthenticated, isOwner } = useAuth(); // Add this

    // State
    const [isEditing, setIsEditing] = useState(false);
    const [editedPost, setEditedPost] = useState<EditedPostState | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Track if we're in the process of deleting

    // Initialize isEditing from URL on component mount
    useEffect(() => {
        const editParam = new URLSearchParams(window.location.search).get('edit');
        setIsEditing(editParam === 'true');
    }, []);

    // Get the post and author
    const post = postId ? api.getPost(postId) : null;
    const author = post?.author;

    // Check if current user can edit/delete this post
    const canEditDelete = isAuthenticated && post && isOwner(post.userId);

    // Delete confirmation - only show if user is owner
    const deleteConfirmation = useDeleteConfirmation({
        onConfirm: async () => {
            setIsDeleting(true); // Set deleting flag
            if (post) {
                try {
                    await post.delete();
                    setTimeout(() => {
                        navigateBack();
                    }, 1000);
                } catch (error) {
                    console.error('Error deleting post:', error);
                    setIsDeleting(false); // Reset on error
                }
            }
        },
        title: 'Conferma eliminazione post',
        message: `Sei sicuro di voler eliminare il post "${post?.title}"? Questa azione non può essere annullata.`
    });

    // Initialize editedPost when post is available
    useEffect(() => {
        if (post && !editedPost) {
            setEditedPost({
                id: post.id,
                userId: post.userId,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt
            });
            setInitialized(true);
        }
    }, [post, editedPost]);

    // Handlers
    const handleEditStart = () => {
        if (canEditDelete) {
            setIsEditing(true);
        }
    };

    const handleEditCancel = () => {
        if (post) {
            setEditedPost({
                id: post.id,
                userId: post.userId,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt
            });
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!editedPost || !post) return;

        try {
            post.title = editedPost.title;
            post.content = editedPost.content;
            await post.save();
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    const handleDoubleClick = () => {
        if (!isEditing && canEditDelete) {
            setIsEditing(true);
        }
    };

    const handleAuthorClick = () => {
        if (author) {
            navigateToUser(author.id);
        }
    };

    // Get back target from navigation store
    const backTarget = getBackTarget();

    // If we're deleting, show loading state immediately
    if (isDeleting || deleteConfirmation.isDeleting) {
        return (
            <LoadingState
                message="Eliminazione del post in corso..."
            />
        );
    }

    // Loading states - show loading until everything is initialized
    if (apiLoading || !api.isInitialized || !initialized) {
        return (
            <LoadingState
                message="Caricamento del post..."
            />
        );
    }

    // Error states (only show if we're not in the process of deleting)
    if (apiError) {
        return (
            <ErrorState
                title="Errore nel caricamento del post"
                message="Impossibile caricare il post. Assicurati che il server sia attivo e che il post esista."
                details={`Post ID: ${postId}`}
                showBackButton={true}
                onBack={() => navigateBack()}
                backText={backTarget === '/' ? 'Torna alla lista' : 'Torna indietro'}
            />
        );
    }

    if (!post) {
        return (
            <ErrorState
                title="Post non trovato"
                message={`Il post con ID "${postId}" non esiste.`}
                showBackButton={true}
                onBack={() => navigateBack()}
                backText={backTarget === '/' ? 'Torna alla lista' : 'Torna indietro'}
            />
        );
    }

    if (!editedPost) {
        return <LoadingState message="Caricamento dettagli post..." />;
    }

    // Determine what to show as title
    const renderTitle = () => {
        if (isEditing) {
            return (
                <TextField
                    fullWidth
                    value={editedPost?.title || ''}
                    onChange={(e) => setEditedPost(prev => prev ? {...prev, title: e.target.value} : null)}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontSize: '2.25rem',
                            fontWeight: 'bold',
                        }
                    }}
                />
            );
        }

        return editedPost?.title || 'Titolo non disponibile';
    };

    // Render content
    const renderContent = () => {
        if (isEditing) {
            return (
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
            );
        }

        return (
            <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
                {editedPost?.content || 'Contenuto non disponibile'}
            </p>
        );
    };

    // Render author section
    const renderAuthorSection = () => {
        if (!author) {
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">Autore non disponibile</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                        {editedPost?.createdAt ? formatDate(editedPost.createdAt) : 'Data non disponibile'}
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAuthorClick}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                    title={`Vai al profilo di ${author.name}`}
                >
                    {author.name}
                </button>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray:500">
                    {editedPost?.createdAt ? formatDate(editedPost.createdAt) : 'Data non disponibile'}
                </span>
            </div>
        );
    };

    return (
        <>
            <DetailPageLayout
                onBack={navigateBack}
                backText={backTarget === '/' ? 'Torna alla lista' : 'Torna indietro'}
                title={renderTitle()}
                subtitle={renderAuthorSection()}
                headerActions={
                    <HeaderActions
                        isEditing={isEditing}
                        onEdit={handleEditStart}
                        onSave={handleSave}
                        onCancel={handleEditCancel}
                        onDelete={canEditDelete ? deleteConfirmation.openDialog : undefined}
                        isDeleting={deleteConfirmation.isDeleting}
                        disableEdit={!canEditDelete || deleteConfirmation.isDeleting}
                        disableSave={!editedPost?.title?.trim() || !editedPost?.content?.trim()}
                        showDelete={canEditDelete}
                    />
                }
                isEditing={isEditing}
                showEditHint={!isEditing && canEditDelete}
                onDoubleClick={handleDoubleClick}
                useNavigationStore={true}
            >
                {renderContent()}
            </DetailPageLayout>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteConfirmation.isOpen}
                title={deleteConfirmation.dialogConfig.title}
                message={deleteConfirmation.dialogConfig.message}
                onConfirm={deleteConfirmation.handleConfirm}
                onCancel={() => {
                    deleteConfirmation.closeDialog();
                    setIsDeleting(false); // Reset deleting flag if cancelled
                }}
                confirmText="Elimina"
                cancelText="Annulla"
                severity="error"
                isLoading={deleteConfirmation.isDeleting}
            />
        </>
    );
}

export default PostDetails;