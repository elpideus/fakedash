import React from 'react';
import { Drawer as MuiDrawer, Box, IconButton, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Props for the Drawer component.
 */
interface DrawerProps {
    /** Whether the drawer is open */
    open: boolean;
    /** Callback fired when the drawer should close */
    onClose: () => void;
    /** Title displayed in the drawer header */
    title: string;
    /** Drawer content */
    children: React.ReactNode;
    /** Width of the drawer (default: 600 px) */
    width?: number | string;
    /** Side from which the drawer appears (default: "right") */
    anchor?: 'left' | 'right' | 'top' | 'bottom';
    /** Whether to show the close (X) button in the header */
    showCloseButton?: boolean;
}

/**
 * Reusable drawer component.
 *
 * Wraps MUI's Drawer with a consistent header, title,
 * optional close button, and scrollable content area.
 */
const Drawer: React.FC<DrawerProps> = ({
                                           open,
                                           onClose,
                                           title,
                                           children,
                                           width = 600,
                                           anchor = 'right',
                                           showCloseButton = true
                                       }) => {
    return (
        <MuiDrawer
            anchor={anchor}
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width,
                    maxWidth: '90vw',
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box
                sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3
                    }}
                >
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>

                    {showCloseButton && (
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                bgcolor: 'action.hover',
                                '&:hover': {
                                    bgcolor: 'action.selected',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Content */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </MuiDrawer>
    );
};

export default Drawer;
