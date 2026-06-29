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
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Application from 'expo-application';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, child, off, update, remove } from 'firebase/database';

const { width } = Dimensions.get('window');

// Срок пробного периода: 7 дней в секундах
const TRIAL_DURATION_SECONDS = 7 * 24 * 60 * 60;

// Настройка Email для приема запросов
const MY_TARGET_EMAIL = "kluh2026@gmail.com"; 

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCJl5iCX9N0k8hFIdzVrfWORzo54VqNQLc",
  authDomain: "my-apk-protection.firebaseapp.com",
  databaseURL: "https://my-apk-protection-default-rtdb.firebaseio.com",
  projectId: "my-apk-protection",
  storageBucket: "my-apk-protection.firebasestorage.app",
  messagingSenderId: "686147592915",
  appId: "1:686147592915:web:9aecdcddc12cdcc1306a26"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export default function App() {
  const [password, setPassword] = useState(null); 
  const [inputPassword, setInputPassword] = useState(''); 
  const [isAuthChecking, setIsAuthChecking] = useState(true); 
  const [isLoadingData, setIsLoadingData] = useState(false); 

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workData, setWorkData] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [archiveModalVisible, setArchiveModalVisible] = useState(false); 
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');

  // Состояния триала и поддержки
  const [trialNotice, setTrialNotice] = useState(false); 
  const [isTrialExpired, setIsTrialExpired] = useState(false); 
  const [daysLeft, setDaysLeft] = useState(7);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+38 (');

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkSavedPassword();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!password) {
      setWorkData({});
      return;
    }

    setIsLoadingData(true);
    const listRef = ref(db, `tabulka_lists/${password}`);

    const unsubscribe = onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWorkData(data);
      } else {
        setWorkData({});
      }
      setIsLoadingData(false);
    }, (error) => {
      Alert.alert("Ошибка БД", "Проверить правила: " + error.message);
      setIsLoadingData(false);
    });

    return () => off(listRef);
  }, [password]);

  const checkSavedPassword = async () => {
    try {
      const deviceId = Application.androidId || "DEVICE_GENERIC";
      const dbRef = ref(db);
      
      const savedPass = await AsyncStorage.getItem('@tabulka_password');
      if (savedPass) {
        const keySnapshot = await get(child(dbRef, `activation_keys/${savedPass}`));
        if (keySnapshot.exists()) {
          const keyData = keySnapshot.val();
          if (keyData.status === "used" && keyData.deviceId === deviceId) {
            setPassword(savedPass);
            setIsAuthChecking(false);
            return; 
          }
        }
      }

      const trialSnapshot = await get(child(dbRef, `trial_devices/${deviceId}`));
      const currentTimeSeconds = Math.floor(Date.now() / 1000);

      if (trialSnapshot.exists()) {
        const trialData = trialSnapshot.val();
        const timePassed = currentTimeSeconds - trialData.startedAt;
        const remainingSeconds = TRIAL_DURATION_SECONDS - timePassed;

        if (remainingSeconds <= 0) {
          setIsTrialExpired(true);
        } else {
          const calculatedDays = Math.ceil(remainingSeconds / (24 * 60 * 60));
          setDaysLeft(calculatedDays);
          setPassword("TRIAL_MODE_" + deviceId);
          setTrialNotice(true);
          setTimeout(() => setTrialNotice(false), 3000);
        }
      } else {
        const trialRef = ref(db, `trial_devices/${deviceId}`);
        await set(trialRef, {
          startedAt: currentTimeSeconds,
          deviceId: deviceId
        });
        setDaysLeft(7);
        setPassword("TRIAL_MODE_" + deviceId);
        setTrialNotice(true);
        setTimeout(() => setTrialNotice(false), 3000);
      }

    } catch (e) {
      Alert.alert("Ошибка", "Не удалось проверить статус авторизации");
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleLogin = async () => {
    const trimmed = inputPassword.trim();
    if (trimmed.length < 3) {
      Alert.alert("Неверный формат", "Слишком короткий ключ активации.");
      return;
    }

    setIsAuthChecking(true);

    try {
      const deviceId = Application.androidId || "DEVICE_GENERIC"; 
      const dbRef = ref(db);
      
      const snapshot = await get(child(dbRef, `activation_keys/${trimmed}`));
      
      if (snapshot.exists()) {
        const keyData = snapshot.val();
        const currentStatus = keyData.status || "free";
        const currentDeviceId = keyData.deviceId || "";

        if (currentStatus === "free" && currentDeviceId === "") {
          const keyRef = ref(db, `activation_keys/${trimmed}`);
          
          await update(keyRef, {
            status: "used",
            deviceId: deviceId
          });

          const requestRef = ref(db, `support_requests/${deviceId}`);
          await remove(requestRef);

          await AsyncStorage.setItem('@tabulka_password', trimmed);
          setIsTrialExpired(false); 
          setPassword(trimmed);
          setInputPassword('');
          Alert.alert("Успешно", "Приложение успешно активировано!");

        } else if (currentStatus === "used") {
          if (currentDeviceId !== "" && currentDeviceId === deviceId) {
            const requestRef = ref(db, `support_requests/${deviceId}`);
            await remove(requestRef);

            await AsyncStorage.setItem('@tabulka_password', trimmed);
            setIsTrialExpired(false);
            setPassword(trimmed);
            setInputPassword('');
          } else {
            Alert.alert("Ошибка активации", "Этот ключ уже закреплен за другим устройством!");
          }
        } else {
          Alert.alert("Блокировка", "Этот ключ заблокирован администратором.");
        }
      } else {
        Alert.alert("Уведомление", `Ключ не найден в папке activation_keys базы данных.`);
      }
    } catch (e) {
      Alert.alert("Ошибка Firebase", "Детали: " + e.message);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleSendSupportRequest = async () => {
    if (!clientName.trim() || clientPhone.trim() === '+38 (' || clientPhone.trim().length < 8) {
      Alert.alert("Ошибка", "Пожалуйста, заполните Имя и Телефон для связи");
      return;
    }

    try {
      const deviceId = Application.androidId || "DEVICE_GENERIC";
      
      const requestRef = ref(db, `support_requests/${deviceId}`);
      await set(requestRef, {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        deviceId: deviceId,
        createdAt: Math.floor(Date.now() / 1000)
      });

      const subject = encodeURIComponent("Запрос ключа активации Tabulka");
      const body = encodeURIComponent(`Данные запроса:\n\nИмя: ${clientName.trim()}\nТелефон: ${clientPhone.trim()}\nID устройства: ${deviceId}`);
      const mailtoUrl = `mailto:${MY_TARGET_EMAIL}?subject=${subject}&body=${body}`;

      setRequestModalVisible(false);

      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert("Запрос сохранен", "Данные записаны в базу. На вашем устройстве не найдено настроенное приложение почты для прямой отправки.");
      }

    } catch (e) {
      setRequestModalVisible(false);
      Alert.alert("Внимание", "Запрос успешно сохранен в Firebase, но не удалось запустить почтовое приложение.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Выход", "Выйти из профиля?", [
      { text: "Отмена", style: "cancel" },
      { 
        text: "Выйти", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('@tabulka_password');
          setIsTrialExpired(false);
          setPassword(null);
          checkSavedPassword(); 
        }
      }
    ]);
  };

  const saveDayToFirebase = async (dateStr, dayData) => {
    try {
      const dayRef = ref(db, `tabulka_lists/${password}/${dateStr}`);
      await set(dayRef, dayData);
    } catch (e) {
      Alert.alert("Ошибка сети", "Не удалось отправить данные");
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

  const getDaysForSpecificMonth = (year, month) => {
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const dayNum = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    });
  };

  const handleDayPress = (dateStr) => {
    setSelectedDate(dateStr);
    if (workData[dateStr] && (workData[dateStr].rate > 0 || workData[dateStr].hours > 0)) {
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
    if (rate === '0' && hours === '0') {
      saveDayToFirebase(selectedDate, null);
      setModalVisible(false);
      return;
    }
    if (!rate || !hours || isNaN(numRate) || isNaN(numHours)) {
      Alert.alert("Ошибка", "Введите корректные числа");
      return;
    }
    saveDayToFirebase(selectedDate, { rate: numRate, hours: numHours });
    setModalVisible(false);
  };

  const calculateStatsForPeriod = (daysList) => {
    let workDays = 0; 
    let weekendDays = 0; 
    let totalSum = 0;
    
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    
    const activeWorkDaysInMonth = daysList.filter(day => workData[day] && (workData[day].rate > 0 && workData[day].hours > 0));
    if (activeWorkDaysInMonth.length === 0) {
      return { workDays: 0, weekendDays: 0, totalSum: 0 };
    }
    
    const firstWorkDayNum = Math.min(...activeWorkDaysInMonth.map(d => parseInt(d.split('-')[2])));
    let lastWorkDayNum = Math.max(...activeWorkDaysInMonth.map(d => parseInt(d.split('-')[2])));
    
    const sampleDay = daysList[0]; 
    const [viewYear, viewMonth] = sampleDay.split('-').map(Number);
    
    if (viewYear === today.getFullYear() && (viewMonth - 1) === today.getMonth()) {
      if (today.getDate() > lastWorkDayNum) {
        lastWorkDayNum = today.getDate();
      }
    }
    
    daysList.forEach(day => {
      const dayNum = parseInt(day.split('-')[2]);
      const hasData = workData[day] && (workData[day].rate > 0 && workData[day].hours > 0);
      if (hasData) { 
        workDays++; 
        totalSum += workData[day].rate * workData[day].hours; 
      } else { 
        if (dayNum >= firstWorkDayNum && dayNum <= lastWorkDayNum) {
          weekendDays++; 
        }
      }
    });
    
    return { workDays, weekendDays, totalSum };
  };

  const stats = calculateStatsForPeriod(getDaysInMonth(currentMonth));

  const getArchiveStatsForMonth = (backMonthsCount) => {
    const targetDate = new Date(); 
    targetDate.setMonth(targetDate.getMonth() - backMonthsCount);
    
    const year = targetDate.getFullYear(); 
    const month = targetDate.getMonth(); 
    const days = getDaysForSpecificMonth(year, month);
    
    let archiveWorkDays = 0; 
    let archiveTotalSum = 0;
    
    const activeDays = days.filter(day => workData[day] && (workData[day].rate > 0 && workData[day].hours > 0));
    if (activeDays.length > 0) {
      days.forEach(day => {
        if (workData[day] && (workData[day].rate > 0 && workData[day].hours > 0)) {
          archiveWorkDays++; 
          archiveTotalSum += workData[day].rate * workData[day].hours;
        }
      });
    }
    const monthName = targetDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    return { monthName, workDays: archiveWorkDays, totalSum: archiveTotalSum };
  };

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const monthStr = currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    let tableRows = '';
    days.forEach(day => {
      const data = workData[day];
      const hasData = data && (data.rate > 0 && data.hours > 0);
      const dayNum = day.split('-')[2];
      if (hasData) {
        tableRows += `<tr><td>${dayNum}</td><td>Рабочий</td><td>${data.rate}</td><td>${data.hours}</td><td>${data.rate * data.hours}</td></tr>`;
      } else {
        tableRows += `<tr><td>${dayNum}</td><td>Выходной</td><td>-</td><td>-</td><td>-</td></tr>`;
      }
    });

    const htmlContent = `<html><head><style>body{font-family:'Helvetica';padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}</style></head><body><h1>Отчет — ${monthStr}</h1><table><tr><th>День</th><th>Статус</th><th>Ставка</th><th>Часы</th><th>Сумма</th></tr>${tableRows}</table></body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось создать PDF");
    }
  };

  if (isAuthChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (isTrialExpired) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={[styles.authCard, { borderColor: '#EF4444', borderWidth: 1.5 }]}>
          <Text style={[styles.authTitle, { color: '#EF4444' }]}>Срок пробного тестирования (7 дней) окончен</Text>
          
          <Text style={[styles.authSubtitle, { marginBottom: 10, fontWeight: 'bold' }]}>Запросить полную версию:</Text>
          <TextInput placeholder="Ваше Имя" style={[styles.authInput, { marginBottom: 10 }]} value={clientName} onChangeText={setClientName} />
          <TextInput placeholder="Телефон" keyboardType="phone-pad" style={[styles.authInput, { marginBottom: 15 }]} value={clientPhone} onChangeText={setClientPhone} />
          <TouchableOpacity style={[styles.authButton, { backgroundColor: '#10B981', marginBottom: 10 }]} onPress={handleSendSupportRequest}>
            <Text style={styles.authButtonText}>Отправить запрос</Text>
          </TouchableOpacity>
          
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeSubText}>Введите Ваше имя и телефон. Ожидайте, Вам перезвонят.</Text>
          </View>

          <View style={{ marginVertical: 15, borderBottomWidth: 1, borderColor: '#E5E7EB' }} />

          <Text style={[styles.authSubtitle, { marginBottom: 10, fontWeight: 'bold' }]}>Ввести постоянный ключ:</Text>
          <TextInput
            placeholder="Постоянный ключ активации"
            autoCapitalize="characters"
            style={styles.authInput}
            value={inputPassword}
            onChangeText={setInputPassword}
          />
          <TouchableOpacity style={[styles.authButton, { backgroundColor: '#0052CC' }]} onPress={handleLogin}>
            <Text style={styles.authButtonText}>Активировать</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentModeTrial = password && password.startsWith("TRIAL_MODE_");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.dateText}>{currentTime.toLocaleDateString('ru-RU')}</Text>
            <Text style={styles.timeText}>{currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          
          {isCurrentModeTrial ? (
            <TouchableOpacity style={styles.requestHeaderButton} onPress={() => setRequestModalVisible(true)}>
              <Text style={styles.requestHeaderButtonText}>Запросить полную версию</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Выход</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.monthTitle}>{currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}</Text>

        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => {
            const isWeekend = day === 'Сб' || day === 'Вс';
            return (
              <Text key={index} style={[styles.weekDayText, isWeekend && styles.weekendText]}>
                {day}
              </Text>
            );
          })}
        </View>

        {isLoadingData ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0052CC" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.calendarGrid}>
            {(() => {
              const days = getDaysInMonth(currentMonth);
              if (days.length === 0) return null;

              const firstDayDate = new Date(days[0]);
              let startOfWeekOffset = firstDayDate.getDay(); 
              startOfWeekOffset = startOfWeekOffset === 0 ? 6 : startOfWeekOffset - 1;

              const gridCells = [];
              for (let i = 0; i < startOfWeekOffset; i++) {
                gridCells.push(<View key={`empty-${i}`} style={[styles.dayCell, { borderColor: 'transparent', backgroundColor: 'transparent' }]} />);
              }

              days.forEach((dateStr) => {
                const isWorkDay = workData[dateStr] && (workData[dateStr].rate > 0 && workData[dateStr].hours > 0);
                const dayNum = dateStr.split('-')[2];
                gridCells.push(
                  <TouchableOpacity 
                    key={dateStr} 
                    style={[styles.dayCell, isWorkDay ? styles.workDayCell : styles.weekendCell]} 
                    onPress={() => handleDayPress(dateStr)}
                  >
                    <Text style={[styles.dayText, isWorkDay && styles.workDayText]}>
                      {parseInt(dayNum)}
                    </Text>
                  </TouchableOpacity>
                );
              });

              const rows = [];
              for (let i = 0; i < gridCells.length; i += 7) {
                rows.push(
                  <View key={`row-${i}`} style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '100%' }}>
                    {gridCells.slice(i, i + 7)}
                  </View>
                );
              }

              return rows;
            })()}
          </ScrollView>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Рабочих дней: {stats.workDays}</Text>
          <Text style={styles.statsText}>Выходных дней: {stats.weekendDays}</Text>
          <Text style={styles.totalText}>Сумма: {stats.totalSum}</Text>
        </View>

        <TouchableOpacity style={styles.archiveButton} onPress={() => setArchiveModalVisible(true)}>
          <Text style={styles.archiveButtonText}>Архив</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}>
          <Text style={styles.pdfButtonText}>Сохранить PDF</Text>
        </TouchableOpacity>

        <Modal visible={requestModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Отправить запрос</Text>
              <TextInput placeholder="Ваше Имя" style={styles.input} value={clientName} onChangeText={setClientName} />
              <TextInput placeholder="Телефон" keyboardType="phone-pad" style={styles.input} value={clientPhone} onChangeText={setClientPhone} />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnSave, { backgroundColor: '#10B981' }]} onPress={handleSendSupportRequest}>
                  <Text style={styles.btnText}>Отправить запрос</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setRequestModalVisible(false)}>
                  <Text style={styles.btnText}>Отмена</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.noticeContainer, { marginTop: 12 }]}>
                <Text style={styles.noticeSubText}>Введите Ваше имя и телефон. Ожидайте, Вам перезвонят.</Text>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={archiveModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Архив</Text>
              <ScrollView style={{ maxHeight: 250 }}>
                {[1, 2, 3, 4].map((m) => {
                  const a = getArchiveStatsForMonth(m);
                  return (
                    <View key={m} style={styles.archiveItem}>
                      <Text style={styles.archiveMonthName}>{a.monthName}</Text>
                      <Text style={styles.archiveItemTotal}>Заработок: {a.totalSum}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={[styles.btn, styles.btnCancel, { width: '100%', marginTop: 10 }]} onPress={() => setArchiveModalVisible(false)}>
                <Text style={styles.btnText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>День: {selectedDate ? selectedDate.split('-')[2] : ''}</Text>
              <TextInput placeholder="Ставка" style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} />
              <TextInput placeholder="Часы" style={styles.input} keyboardType="numeric" value={hours} onChangeText={setHours} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveDay}><Text style={styles.btnText}>Сохранить</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>Отмена</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {trialNotice && (
        <View style={styles.trialToastContainer} pointerEvents="none">
          <View style={styles.trialToast}>
            <Text style={styles.trialToastText}>⏱ АКТИВЕН ТЕСТОВЫЙ ПЕРИОД (ОСТАЛОСЬ {daysLeft} ДН.)</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  authContainer: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  authCard: { width: width * 0.9, backgroundColor: '#FFF', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  authTitle: { fontSize: 20, fontWeight: 'bold', color: '#EF4444', marginBottom: 15, textAlign: 'center' },
  authSubtitle: { fontSize: 14, color: '#4B5563', marginBottom: 8, textAlign: 'left' },
  authInput: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  authButton: { padding: 13, borderRadius: 10, alignItems: 'center' },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 30 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateText: { fontSize: 14, color: '#6B7280' },
  timeText: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  
  logoutButton: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#EF4444', borderRadius: 6 },
  logoutText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  requestHeaderButton: { flex: 1, marginHorizontal: 6, paddingVertical: 6, paddingHorizontal: 4, backgroundColor: '#10B981', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  requestHeaderButtonText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },

  monthTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 10, textAlign: 'center' },
  weekDaysRow: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { width: (width - 32) / 7 - 8, marginHorizontal: 4, textAlign: 'center', fontWeight: '700', color: '#9CA3AF' },
  weekendText: { color: '#EF4444' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: (width - 32) / 7 - 8, height: 42, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  weekendCell: { backgroundColor: '#FFF', borderColor: '#E5E7EB' },
  workDayCell: { backgroundColor: '#0052CC', borderColor: '#0052CC' },
  dayText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  workDayText: { color: '#FFF' },
  statsContainer: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  statsText: { fontSize: 14, color: '#4B5563' },
  totalText: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  archiveButton: { backgroundColor: '#0052CC', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  archiveButtonText: { color: '#FFF', fontWeight: 'bold' },
  pdfButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  pdfButtonText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  archiveItem: { padding: 10, backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 6 },
  archiveMonthName: { fontWeight: 'bold', color: '#0052CC' },
  archiveItemTotal: { fontWeight: 'bold' },
  input: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  btnSave: { backgroundColor: '#0052CC', flex: 1, marginRight: 5 },
  btnCancel: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  
  noticeContainer: { backgroundColor: '#0052CC', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeSubText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },

  trialToastContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  trialToast: { backgroundColor: 'rgba(0, 0, 0, 0.88)', paddingVertical: 18, paddingHorizontal: 26, borderRadius: 14, maxWidth: width * 0.9, elevation: 8 },
  trialToastText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5 }
});
