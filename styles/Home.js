import { StyleSheet } from "react-native";

const HomeStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  tabText: {
    fontSize: 16,
  },
  tabTextActive: {
    fontWeight: "bold",
  },
  feed: {
    flex: 1,
    paddingHorizontal: 10,
  },
});

export default HomeStyle;
