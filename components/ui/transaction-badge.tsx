import * as React from 'react';
import { Badge, useTheme } from 'react-native-paper';

const TransactionBadge = ({ children, isIncome }: { children: string, isIncome: boolean }) => {
    const { colors } = useTheme();

    // Tentukan warna berdasarkan tipe transaksi
    const baseColor = isIncome ? colors.primary : colors.error;
    // Membuat warna background transparan (misal: opasitas 0.1)
    const backgroundColor = isIncome ? colors.primaryContainer : colors.errorContainer;

    return (
        <Badge
            style={{
                backgroundColor: backgroundColor, // Background tipis
                color: baseColor,               // Warna teks
                borderColor: baseColor,          // Warna border
                borderWidth: 1,
                borderRadius: 12,               // Membuat bentuk Pill/Lonjong
                paddingHorizontal: 4,
                height: 'auto',
                fontSize: 10,                 // Agar fleksibel dengan teks
            }}
        >
            {`${isIncome ? '← ' : '→ '}` + children}
        </Badge>
    );
};

export default TransactionBadge;