import React from 'react';
import { Drawer as MuiDrawer, Box, IconButton, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Interface for the {@link Drawer} component properties.
 */
interface DrawerProps {
    /** Whether the drawer is open and visible. */
    open: boolean;
    /** Callback function triggered when the drawer requests to close. */
    onClose: () => void;
    /** Text displayed prominently in the header of the drawer. */
    title: string;
    /** The main content area of the drawer. */
    children: React.ReactNode;
    /** * The horizontal or vertical size of the drawer.
     * @default 600
     */
    width?: number | string;
    /** * Specifies which side of the screen the drawer attaches to.
     * @default 'right'
     */
    anchor?: 'left' | 'right' | 'top' | 'bottom';
    /** * If true, displays an 'X' button in the top right corner.
     * @default true
     */
    showCloseButton?: boolean;
}

/**
 * A standardized side-panel component built on top of Material UI's Drawer.
 *
 * Provides a consistent header layout, automatic overflow handling for content,
 * and responsive width constraints.
 *
 * @component
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
                {/* Header Section */}
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

                {/* Scrollable Content Area */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </MuiDrawer>
    );
};

export default Drawer;