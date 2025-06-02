import AsyncStorage from "@react-native-async-storage/async-storage";

export default (current, action) => {
    switch (action.type) {
        case 'login': case 'update':
            return action.payload;
        case 'logout':
            AsyncStorage.multiRemove(['token', 'refresh']);
            return null;
    }
    return current;
}