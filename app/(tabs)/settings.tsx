import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '../../hooks/useAuth';

function SettingRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value ?? '-'}</Text>
    </View>
  );
}

function MenuButton({ icon, label, onPress, destructive }: {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            {user?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Company Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company</Text>
        <View style={styles.card}>
          <SettingRow label="Company Name" value={user?.company?.company_name} />
        </View>
      </View>

      {/* Permissions Section */}
      {user?.permissions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Permissions</Text>
          <View style={styles.card}>
            <View style={styles.permissionsGrid}>
              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>{user.permissions.can_manage_customers ? '✓' : '✕'}</Text>
                <Text style={styles.permissionLabel}>Customers</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>{user.permissions.can_manage_jobs ? '✓' : '✕'}</Text>
                <Text style={styles.permissionLabel}>Jobs</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>{user.permissions.can_manage_invoices ? '✓' : '✕'}</Text>
                <Text style={styles.permissionLabel}>Invoices</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>{user.permissions.can_view_reports ? '✓' : '✕'}</Text>
                <Text style={styles.permissionLabel}>Reports</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <MenuButton icon="🚪" label="Logout" onPress={handleLogout} destructive />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>TradeMate Mobile</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  card: { backgroundColor: '#ffffff', borderRadius: 12 },
  profileHeader: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700' },
  profileEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  roleBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#4338ca', textTransform: 'capitalize' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingLabel: { fontSize: 15, color: '#374151' },
  settingValue: { fontSize: 15, color: '#6b7280', fontWeight: '500' },
  permissionsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  permissionItem: { width: '50%', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  permissionIcon: { fontSize: 16, marginRight: 8, color: '#10b981' },
  permissionLabel: { fontSize: 14, color: '#374151' },
  menuButton: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: '#374151' },
  menuLabelDestructive: { color: '#dc2626' },
  menuArrow: { fontSize: 20, color: '#9ca3af' },
  appInfo: { alignItems: 'center', marginTop: 32, marginBottom: 16 },
  appInfoText: { fontSize: 14, color: '#9ca3af' },
  appInfoVersion: { fontSize: 12, color: '#d1d5db', marginTop: 4 },
  bottomPadding: { height: 24 },
});
