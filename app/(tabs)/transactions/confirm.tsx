import TransactionCategoryPicker from "@/components/forms/transaction-form/transaction-category-picker";
import {usePendingTransaction} from "@/hooks/use-pending-transaction";
import {handleNotificationAction} from "@/services/NotificationService";
import useWalletsStore from "@/store/use-wallets-store";
import {useLocalSearchParams, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {
  Button,
  Card,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

interface FormData {
  walletId: number;
  transactionTypeId: number;
  categoryId: number;
  note: string;
}

export default function ConfirmTransactionScreen() {
  const router = useRouter();
  const {pendingId} = useLocalSearchParams<{pendingId: string}>();
  const {pending, loading, skipTransaction, confirmTransaction} =
    usePendingTransaction(pendingId);
  const wallets = useWalletsStore((state) => state.wallets);
  const theme = useTheme();

  const [form, setForm] = useState<FormData>({
    walletId: 0,
    transactionTypeId: 1,
    categoryId: 0,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "success",
  );

  const walletName = wallets.find((w) => w.id === form.walletId)?.name || "";

  // Auto-detect wallet
  useEffect(() => {
    if (!pending || form.walletId) return;
    const appLower = pending.app.toLowerCase();
    const matching = wallets.find(
      (w: any) =>
        w.name.toLowerCase().includes(appLower) ||
        appLower.includes(w.name.toLowerCase()),
    );
    if (matching) {
      setForm((prev) => ({...prev, walletId: matching.id}));
    } else if (wallets.length > 0) {
      setForm((prev) => ({...prev, walletId: wallets[0].id}));
    }
  }, [pending, wallets, form.walletId]);

  const handleSubmit = async () => {
    if (!pending || form.categoryId === 0 || form.walletId === 0) {
      setSnackbarMessage("Pilih dompet dan kategori");
      setSnackbarType("error");
      setSnackbarVisible(true);
      return;
    }

    setSubmitting(true);
    try {
      await handleNotificationAction({
        app: pending.app,
        title: pending.title,
        text: pending.text,
        date: new Date(pending.timestamp).toISOString(),
      });

      await confirmTransaction(pending.id);

      setSnackbarMessage("Transaksi berhasil dikonfirmasi");
      setSnackbarType("success");
      setSnackbarVisible(true);

      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (error) {
      console.error("Error confirming transaction:", error);
      setSnackbarMessage("Gagal mengkonfirmasi transaksi");
      setSnackbarType("error");
      setSnackbarVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!pending) return;
    try {
      await skipTransaction(pending.id);
      setSnackbarMessage("Transaksi dilewati");
      setSnackbarType("success");
      setSnackbarVisible(true);
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (error) {
      console.error("Error skipping transaction:", error);
      setSnackbarMessage("Gagal melewati transaksi");
      setSnackbarType("error");
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!pending) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}
      >
        <Text>Tidak ada transaksi yang menunggu</Text>
        <Button
          mode="contained"
          onPress={() => router.replace("/")}
          style={styles.button}
        >
          Kembali
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text variant="headlineLarge" style={styles.title}>
        Konfirmasi Transaksi
      </Text>

      <Card style={styles.detailCard}>
        <Card.Content>
          <Text variant="labelMedium">Sumber Aplikasi</Text>
          <Text variant="bodyLarge" style={styles.detailValue}>
            {pending.app}
          </Text>

          <Text variant="labelMedium" style={styles.detailLabel}>
            Jumlah
          </Text>
          <Text
            variant="headlineMedium"
            style={[styles.detailValue, {color: theme.colors.error}]}
          >
            Rp {pending.amount.toLocaleString("id-ID")}
          </Text>

          <Text variant="labelMedium" style={styles.detailLabel}>
            Tanggal & Waktu
          </Text>
          <Text variant="bodySmall" style={styles.detailValue}>
            {new Date(pending.timestamp).toLocaleString("id-ID")}
          </Text>

          <Text variant="labelMedium" style={styles.detailLabel}>
            Teks Notifikasi
          </Text>
          <Text variant="bodySmall" style={styles.detailValue}>
            {pending.title} {pending.text}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.fieldLabel}>
            Dompet (Required)
          </Text>
          <TextInput
            mode="outlined"
            value={walletName}
            editable={false}
            style={styles.input}
            theme={theme}
          />

          <Text variant="labelMedium" style={styles.fieldLabel}>
            Kategori (Required)
          </Text>
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.categoryButton}
            contentStyle={styles.buttonContent}
          >
            {form.categoryId > 0
              ? `Category ${form.categoryId}`
              : "Pilih Kategori"}
          </Button>

          <Text variant="labelMedium" style={styles.fieldLabel}>
            Catatan (Optional)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Tambahkan catatan"
            value={form.note}
            onChangeText={(text: string) =>
              setForm((prev) => ({...prev, note: text}))
            }
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={theme}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleSkip}
          disabled={submitting}
          style={styles.button}
        >
          Lewati
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={form.categoryId === 0 || form.walletId === 0 || submitting}
          loading={submitting}
          style={styles.button}
        >
          Konfirmasi
        </Button>
      </View>

      <TransactionCategoryPicker
        transactionTypeId={form.transactionTypeId}
        transactionCategoryId={form.categoryId}
        onTypeChange={(typeId: number) =>
          setForm((prev) => ({
            ...prev,
            transactionTypeId: typeId,
            categoryId: 0,
          }))
        }
        onCategoryChange={(catId: number) =>
          setForm((prev) => ({...prev, categoryId: catId}))
        }
        isNotification={true}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{
          backgroundColor:
            snackbarType === "success"
              ? theme.colors.primary
              : theme.colors.error,
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  contentContainer: {padding: 16, gap: 16},
  title: {marginBottom: 8},
  detailCard: {marginBottom: 8},
  detailLabel: {marginTop: 12},
  detailValue: {marginTop: 4},
  formCard: {marginBottom: 8},
  fieldLabel: {marginTop: 12, marginBottom: 8},
  input: {marginBottom: 8},
  categoryButton: {marginBottom: 8, justifyContent: "center"},
  buttonContent: {paddingVertical: 8},
  buttonContainer: {flexDirection: "row", gap: 8, marginBottom: 16},
  button: {flex: 1},
});
