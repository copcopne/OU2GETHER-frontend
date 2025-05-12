import { StyleSheet } from "react-native";

export default StyleSheet.create({
  error: {
    color: "red",
    fontSize: 14
  }, avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  container: {
    alignItems: 'center',
    flex: 1,
  },

  coverImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
  },

  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },

  coverText: {
    color: '#666',
    fontSize: 16,
  },

  avatarWrapper: {
    position: 'absolute',
    top: -40,
    left: '20%',
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },

  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
  }

});