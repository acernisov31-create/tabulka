import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  SafeAreaView, 
  Dimensions,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workData, setWorkData] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');

  // Массив для верхней полоски дней недели
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    loadData();
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@tabulka_data');
      if (saved) setWorkData(JSON.parse(saved));
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось загрузить данные");
    }
  };

  const saveData = async (newData) => {
    try {
      await AsyncStorage.setItem('@tabulka_data', JSON.stringify(newData));
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось сохранить данные");
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const dayNum = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    });
  };

  const handleDayPress = (dateStr) => {
    setSelectedDate(dateStr);
    if (workData[dateStr]) {
      setRate(workData[dateStr].rate.toString());
      setHours(workData[dateStr].hours.toString());
    } else {
      setRate('');
      setHours('');
    }
    setModalVisible(true);
  };

  const handleSaveDay = () => {
    const numRate = parseFloat(rate);
    const numHours = parseFloat(hours);

    if (!rate || !hours || isNaN(numRate) || isNaN(numHours)) {
      Alert.alert("Ошибка", "Введите корректные числа");
      return;
    }

    const updatedData = {
      ...workData,
      [selectedDate]: { rate: numRate, hours: numHours }
    };

    setWorkData(updatedData);
    saveData(updatedData);
    setModalVisible(false);
  };

  const getStatistics = () => {
    const days = getDaysInMonth(currentMonth);
    let workDays = 0;
    let totalSum = 0;

    days.forEach(day => {
      if (workData[day]) {
        workDays++;
        totalSum += workData[day].rate * workData[day].hours;
      }
    });

    const weekendDays = days.length - workDays;
    return { workDays, weekendDays, totalSum };
  };

  const stats = getStatistics();

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const monthStr = currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    
    let tableRows = '';
    days.forEach(day => {
      const data = workData[day];
      const dayNum = day.split('-')[2];
      if (data) {
        const daySum = data.rate * data.hours;
        tableRows += `<tr><td>${dayNum}</td><td>Рабочий</td><td>${data.rate}</td><td>${data.hours}</td><td>${daySum}</td></tr>`;
      } else {
        tableRows += `<tr><td>${dayNum}</td><td>Выходной</td><td>-</td><td>-</td><td>-</td></tr>`;
      }
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica'; padding: 20px; color: #333; }
            h1 { text-align: center; color: #0052CC; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f3f4f6; }
            .stats { margin-top: 30px; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Отчет «Табулька» — ${monthStr}</h1>
          <table>
            <tr><th>День</th><th>Статус</th><th>Ставка</th><th>Часы</th><th>Сумма</th></tr>
            ${tableRows}
          </table>
          <div class="stats">
            <p>Отработано дней: ${stats.workDays}</p>
            <p>Выходных дней: ${stats.weekendDays}</p>
            <p>Общий заработок: ${stats.totalSum}</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать или отправить PDF");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Верхняя панель: дата/время и кнопка Архива */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{currentTime.toLocaleDateString('ru-RU')}</Text>
            <Text style={styles.timeText}>{currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <TouchableOpacity style={styles.archiveButton} onPress={() => Alert.alert("Архив", "История доступна за последние 6 месяцев.")}>
            <Text style={styles.archiveText}>Архив</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}
        </Text>

        {/* НАША НОВАЯ ПОЛОСКА С ДНЯМИ НЕДЕЛИ НАД СЕТКОЙ */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <Text 
              key={index} 
              style={[
                styles.weekDayText, 
                (day === 'Сб' || day === 'Вс') && styles.weekendText
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Календарная сетка */}
        <ScrollView contentContainerStyle={styles.calendarGrid}>
          {getDaysInMonth(currentMonth).map((dateStr) => {
            const isWorkDay = !!workData[dateStr];
            const dayNum = dateStr.split('-')[2];
            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.dayCell, isWorkDay ? styles.workDayCell : styles.weekendCell]}
                onPress={() => handleDayPress(dateStr)}
              >
                <Text style={[styles.dayText, isWorkDay && styles.workDayText]}>{parseInt(dayNum)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Статистика внизу экрана */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Отработано дней: <Text style={styles.bold}>{stats.workDays}</Text></Text>
          <Text style={styles.statsText}>Выходных дней: <Text style={styles.bold}>{stats.weekendDays}</Text></Text>
          <Text style={styles.totalText}>Сумма: <Text style={styles.bold}>{stats.totalSum}</Text></Text>
        </View>

        {/* Кнопка Поделиться PDF */}
        <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}>
          <Text style={styles.pdfButtonText}>Сохранить PDF и поделиться</Text>
        </TouchableOpacity>

        {/* Всплывающее окно (Модалка) */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>День: {selectedDate ? selectedDate.split('-')[2] : ''}</Text>
              
              {workData[selectedDate] && (
                <Text style={styles.historyHint}>
                  В этот день отработано часов: {workData[selectedDate].hours}, ставка: {workData[selectedDate].rate}. Итого за день: {workData[selectedDate].rate * workData[selectedDate].hours}
                </Text>
              )}

              <TextInput
                placeholder="Стоимость часа работы"
                style={styles.input}
                keyboardType="numeric"
                value={rate}
                onChangeText={setRate}
              />
              <TextInput
                placeholder="Количество часов"
                style={styles.input}
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveDay}>
                  <Text style={styles.btnText}>Добавить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 40, paddingBottom: 20 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateText: { fontSize: 16, color: '#6B7280' },
  timeText: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  archiveButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#E5E7EB', borderRadius: 8 },
  archiveText: { color: '#374151', fontWeight: '600' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 15, textAlign: 'center' },
  
  // Новые стили для строчки дней недели
  weekDaysRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    paddingHorizontal: 4, 
    marginBottom: 8 
  },
  weekDayText: { 
    width: (width - 32) / 7 - 8, 
    marginHorizontal: 4, 
    textAlign: 'center', 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#9CA3AF' 
  },
  weekendText: { 
    color: '#EF4444' // Красный цвет для Сб и Вс
  },

  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: (width - 32) / 7 - 8, height: 45, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  weekendCell: { backgroundColor: '#FFF', borderColor: '#E5E7EB' },
  workDayCell: { backgroundColor: '#0052CC', borderColor: '#0052CC' },
  dayText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  workDayText: { color: '#FFF' },
  statsContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginTop: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  statsText: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  bold: { fontWeight: 'bold', color: '#111827' },
  pdfButton: { backgroundColor: '#10B981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 15, marginBottom: 10 },
  pdfButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', padding: 20, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  historyHint: { fontSize: 13, color: '#0052CC', marginBottom: 15, fontWeight: '500', lineHeight: 18 },
  input: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 8, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 0.48, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSave: { backgroundColor: '#0052CC' },
  btnCancel: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});
