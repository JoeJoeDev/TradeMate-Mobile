import { useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { useJobs } from '../../hooks/useApi';
import { Job } from '../../types';

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6',
  in_progress: '#f59e0b',
  complete: '#10b981',
  cancelled: '#6b7280',
};

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data, isLoading, refetch, isRefetching } = useJobs({ per_page: 1000 });
  const jobs = data?.data || [];

  // Group jobs by date
  const jobsByDate = useMemo(() => {
    const grouped: Record<string, Job[]> = {};
    jobs.forEach((job) => {
      if (job.scheduled_at) {
        const date = job.scheduled_at.split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(job);
      }
    });
    return grouped;
  }, [jobs]);

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    Object.keys(jobsByDate).forEach((date) => {
      const dateJobs = jobsByDate[date];
      const dots = dateJobs.slice(0, 3).map((job, i) => ({
        key: `dot-${i}`,
        color: statusColors[job.status] || '#6b7280',
      }));

      marks[date] = {
        dots,
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? '#1e3a5f' : undefined,
      };
    });

    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: '#1e3a5f',
      };
    }

    return marks;
  }, [jobsByDate, selectedDate]);

  const selectedJobs = jobsByDate[selectedDate] || [];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-NZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSelectedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#6b7280',
          selectedDayBackgroundColor: '#1e3a5f',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#1e3a5f',
          dayTextColor: '#1f2937',
          textDisabledColor: '#d1d5db',
          dotColor: '#1e3a5f',
          arrowColor: '#1e3a5f',
          monthTextColor: '#1f2937',
          textDayFontWeight: '500',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
        }}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
      />

      <View style={styles.agendaSection}>
        <Text style={styles.agendaTitle}>{formatSelectedDate(selectedDate)}</Text>

        {selectedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No jobs scheduled for this day</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/job/create')}
            >
              <Text style={styles.addButtonText}>+ Add Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          selectedJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/job/${job.id}`)}
            >
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: statusColors[job.status] || '#6b7280' },
                ]}
              />
              <View style={styles.jobContent}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  {job.scheduled_at && (
                    <Text style={styles.jobTime}>{formatTime(job.scheduled_at)}</Text>
                  )}
                </View>
                <Text style={styles.jobCustomer} numberOfLines={1}>
                  {job.customer?.customer_name || 'No customer'}
                </Text>
                <View style={styles.jobMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[job.status] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusColors[job.status] },
                      ]}
                    >
                      {job.status?.replace('_', ' ')}
                    </Text>
                  </View>
                  {job.priority === 'high' || job.priority === 'urgent' ? (
                    <Text style={styles.priorityBadge}>
                      {job.priority === 'urgent' ? '🔴' : '🟠'} {job.priority}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status Legend</Text>
        <View style={styles.legendItems}>
          {Object.entries(statusColors).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{status.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  calendar: {
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  agendaSection: {
    padding: 16,
    paddingTop: 8,
  },
  agendaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
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
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 4,
  },
  jobContent: {
    flex: 1,
    padding: 14,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  jobTime: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  jobCustomer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  legend: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  bottomPadding: {
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

