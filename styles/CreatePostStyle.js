import { StyleSheet, Platform } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  createPostCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  inputSection: {
    flex: 1,
  },
  name: {
    fontSize: RFValue(14),
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    fontSize: RFValue(14),
    minHeight: 35,
    maxHeight: 120,
    paddingVertical: Platform.OS === "ios" ? 6 : 0,
    color: "#333",
  },
  chipRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-start",
  },
  chip: {
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  chipActive: {
    backgroundColor: "#eeeeee",
  },
  mediaContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
