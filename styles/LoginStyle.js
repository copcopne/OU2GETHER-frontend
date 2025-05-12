import { StyleSheet } from "react-native";

const LoginStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  backButton: {
    backgroundColor: "#555",
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  p: {
    padding: 24,
  }, 
  subTitle: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
  }
});

export default LoginStyle;
