import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';

export default function App() {
  const [exams, setExams] = useState([
    { id: '1', subject: 'Math', date: '2024-05-15', time: '09:00' },
  ]);

  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const addExam = () => {
    if (!subject || !date || !time) return;
    const id = (exams.length + 1).toString();
    setExams([...exams, { id, subject, date, time }]);
    setSubject('');
    setDate('');
    setTime('');
  };

  const renderExam = ({ item }) => (
    <View style={styles.examItem}>
      <Text style={styles.examSubject}>{item.subject}</Text>
      <Text style={styles.examDetails}>{`${item.date} at ${item.time}`}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>UK Exam Schedule</Text>
      <FlatList
        data={exams}
        renderItem={renderExam}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Time (HH:MM)"
          value={time}
          onChangeText={setTime}
        />
        <Button title="Add Exam" onPress={addExam} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e90ff',
  },
  list: {
    flex: 1,
  },
  examItem: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examSubject: {
    fontSize: 18,
    fontWeight: '600',
  },
  examDetails: {
    fontSize: 14,
    color: '#555555',
  },
  form: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
