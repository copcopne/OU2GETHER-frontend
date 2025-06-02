import { View, StyleSheet, Dimensions } from "react-native";
import { Button, Text } from "react-native-paper";

const PollResult = ({ pollData, modalRef }) => {
  const { question, options } = pollData;

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Kết quả khảo sát</Text>
        </View>
        <View style={styles.headerAction}>
          <Button onPress={() => modalRef.current?.dismiss()}>XONG</Button>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.questionText}>{question}</Text>

        <View style={styles.divider} />

        {options.map((opt) => {
          const percent =
            totalVotes > 0
              ? Math.round((opt.vote_count / totalVotes) * 100)
              : 0;

          return (
            <View key={opt.id} style={styles.optionRow}>
              <View style={styles.optionTextWrapper}>
                <Text style={styles.optionText}>{opt.content}</Text>
                <Text style={styles.voteCountText}>
                  {opt.vote_count}{" "}
                  {totalVotes > 0 ? `(${percent}%)` : ""}
                </Text>
              </View>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${percent}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
};

export default PollResult;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  headerPlaceholder: {
    flex: 1,
  },
  headerTitleWrapper: {
    flex: 2,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  headerAction: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 16,
  },

  contentContainer: {
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 12,
  },
  optionRow: {
    marginBottom: 16,
  },
  optionTextWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
    flexShrink: 1,
  },
  voteCountText: {
    fontSize: 14,
    color: "#666",
  },
  barContainer: {
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#1976D2",
  },
});
