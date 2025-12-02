import { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useJobs, useStartJob, useCompleteJob } from '../../hooks/useApi';
import { Job } from '../../types';

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6',
  in_progress: '#f59e0b',
  complete: '#10b981',
  cancelled: '#6b7280',
};

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function JobCard({ job, onStart, onComplete, onPress }: {
  job: Job;
  onStart: () => void;
  onComplete: () => void;
  onPress: () => void;
}) {
  const formatDate = (date?: string) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleDateString('en-NZ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          {job.job_number && (
            <Text style={styles.jobNumber}>#{job.job_number}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[job.status] || '#6b7280' }]}>
          <Text style={styles.statusText}>{job.status?.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.customerName} numberOfLines={1}>
        {job.customer?.customer_name || 'No customer'}
      </Text>
      <Text style={styles.scheduleDate}>{formatDate(job.scheduled_at)}</Text>

      <View style={styles.jobActions}>
        {job.status === 'scheduled' && (
          <TouchableOpacity style={styles.actionButton} onPress={(e) => { e.stopPropagation(); onStart(); }}>
            <Text style={styles.actionButtonText}>Start Job</Text>
          </TouchableOpacity>
        )}
        {job.status === 'in_progress' && (
          <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={(e) => { e.stopPropagation(); onComplete(); }}>
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
        {(job.status === 'complete' || job.status === 'cancelled') && (
          <Text style={styles.completedText}>
            {job.status === 'complete' ? '✓ Completed' : '✕ Cancelled'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function JobsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch, isRefetching } = useJobs({
    search: search || undefined,
    status: statusFilter,
  });

  const startJob = useStartJob();
  const completeJob = useCompleteJob();

  const jobs = data?.data || [];

  const handleStartJob = (job: Job) => {
    Alert.alert('Start Job', `Start "${job.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => startJob.mutate(job.id, {
          onError: (error: any) => {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to start job');
          },
        }),
      },
    ]);
  };

  const handleCompleteJob = (job: Job) => {
    Alert.alert('Complete Job', `Mark "${job.title}" as complete?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => completeJob.mutate(job.id, {
          onError: (error: any) => {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to complete job');
          },
        }),
      },
    ]);
  };

  const renderJob = ({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onStart={() => handleStartJob(item)}
      onComplete={() => handleCompleteJob(item)}
      onPress={() => router.push(`/job/${item.id}`)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FilterChip label="All" active={!statusFilter} onPress={() => setStatusFilter(undefined)} />
        <FilterChip label="Scheduled" active={statusFilter === 'scheduled'} onPress={() => setStatusFilter('scheduled')} />
        <FilterChip label="In Progress" active={statusFilter === 'in_progress'} onPress={() => setStatusFilter('in_progress')} />
        <FilterChip label="Complete" active={statusFilter === 'complete'} onPress={() => setStatusFilter('complete')} />
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search' : 'Create a job to get started'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/job/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: { backgroundColor: '#1e3a5f', borderColor: '#1e3a5f' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  filterChipTextActive: { color: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingTop: 8 },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitleContainer: { flex: 1, marginRight: 12 },
  jobTitle: { fontSize: 16, fontWeight: '600' },
  jobNumber: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#ffffff', textTransform: 'capitalize' },
  customerName: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 },
  scheduleDate: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  jobActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  actionButton: { backgroundColor: '#1e3a5f', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  completeButton: { backgroundColor: '#10b981' },
  actionButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  completedText: { fontSize: 13, color: '#6b7280', paddingVertical: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
});
