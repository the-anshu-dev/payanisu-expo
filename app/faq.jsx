import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const FAQ = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/faq/get`);
        if (!response.ok) {
          throw new Error('Failed to fetch FAQ data');
        }
        const data = await response.json();
        setFaqData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFaqData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Frequently Asked Questions</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Frequently Asked Questions</Text>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      <ScrollView style={styles.scrollView}>
        {faqData.map((item) => (
          <FAQItem
            key={item._id}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    color: '#666',
  },
  answerContainer: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
});

export default FAQ;