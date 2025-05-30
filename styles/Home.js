import { StyleSheet } from "react-native";

const HomeStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems:"center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff"
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff"
  },
  tabText: {
    fontSize: 16,
    padding: 16
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
