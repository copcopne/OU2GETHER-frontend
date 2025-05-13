import { createContext, useState } from "react";
import { Portal, Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const UserContext = createContext();
export const DispatchContext = createContext();

export const SnackbarContext = createContext();
export const SnackbarProvider = ({ children }) => {
    const insets = useSafeAreaInsets();
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: '',
        type: 'success',
    });

    return (
        <SnackbarContext.Provider value={{ setSnackbar }}>
            {children}

            <Portal>
                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
                    duration={3000}
                    style= {{ 
                        backgroundColor: snackbar.type === 'success' ? '#4caf50' : '#f44336',
                        position: 'absolute',
                        bottom: insets.bottom + 56,
                        left: 0,
                        right: 0,
                     }}
                >
                    {snackbar.message}
                </Snackbar>
            </Portal>
        </SnackbarContext.Provider>
    );
};