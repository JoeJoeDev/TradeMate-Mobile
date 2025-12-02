import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useDashboard } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Job } from '../../types';

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const statusColors: Record<string, string> = {
    scheduled: '#3b82f6',
    in_progress: '#f59e0b',
    complete: '#10b981',
    cancelled: '#6b7280',
  };

  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[job.status] || '#6b7280' }]}>
          <Text style={styles.statusText}>{job.status?.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.jobCustomer} numberOfLines={1}>
        {job.customer?.customer_name || 'No customer'}
      </Text>
      {job.scheduled_at && (
        <Text style={styles.jobDate}>
          {new Date(job.scheduled_at).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  const stats = data?.stats;
  const upcomingJobs = data?.upcoming_jobs || [];
  const recentJobs = data?.recent_jobs || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Jobs Today"
          value={stats?.jobs_today ?? 0}
          color="#3b82f6"
        />
        <StatCard
          title="Overdue Jobs"
          value={stats?.jobs_overdue ?? 0}
          color="#ef4444"
        />
        <StatCard
          title="Outstanding"
          value={stats?.outstanding_invoices ?? 0}
          color="#f59e0b"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.this_month_revenue ?? 0)}
          color="#10b981"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {upcomingJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming jobs</Text>
          </View>
        ) : (
          upcomingJobs.slice(0, 5).map((job: Job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => router.push('/(tabs)/jobs')}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        ) : (
          recentJobs.slice(0, 5).map((job: Job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => router.push('/(tabs)/jobs')}
            />
          ))
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#1e3a5f',
    padding: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    marginTop: -16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    margin: '1.5%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1e3a5f',
    fontWeight: '500',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  jobCustomer: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  bottomPadding: {
    height: 24,
  },
});
