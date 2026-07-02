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

const { width } = Dimensions.get('window');
const TRIAL_DURATION_SECONDS = 7 * 24 * 60 * 60;
const MY_TARGET_EMAIL = "kluh2026@gmail.com"; 

const FIREBASE_REST_URL = "https://my-apk-protection-default-rtdb.firebaseio.com";

const translations = {
  ru: {
    locale: 'ru-RU',
    trialExpiredTitle: "Срок пробного тестирования (7 дней) окончен",
    requestFullVersion: "Запросить полную версию:",
    requestFullVersionHeader: "Запросить полную версию",
    placeholderName: "Ваше Имя",
    placeholderPhone: "Телефон",
    btnSendRequest: "Отправить запрос",
    noticeText: "Введите Ваше имя и телефон. Ожайдайте, Вам перезвонят.",
    enterKeyTitle: "Ввести постоянный ключ:",
    placeholderKey: "Постоянный ключ активации",
    btnActivate: "Активировать",
    btnExit: "Выход",
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    statsWorkDays: "Рабочих дней",
    statsWeekendDays: "Выходных дней",
    statsTotalSum: "Сумма",
    btnArchive: "Архив",
    btnSavePdf: "Сохранить PDF",
    modalDayTitle: "День",
    placeholderRate: "Ставка",
    placeholderHours: "Часы",
    btnSave: "Сохранить",
    btnCancel: "Отмена",
    btnClose: "Закрыть",
    archiveEarnings: "Заработок",
    toastTrialActive: "⏱ АКТИВЕН ТЕСТОВЫЙ ПЕРИОД (ОСТАЛОСЬ {days} ДН.)",
    pdfTitle: "Отчет — {month}",
    pdfStatusWork: "Рабочий",
    pdfStatusWeekend: "Выходной",
    pdfColDay: "День",
    pdfColStatus: "Статус",
    pdfColRate: "Ставка",
    pdfColHours: "Часы",
    pdfColSum: "Сумма",
    alertExitTitle: "Выход",
    alertExitMessage: "Выйти из профиля?",
    alertExitCancel: "Отмена",
    alertFormatError: "Неверный формат",
    alertFormatShort: "Слишком короткий ключ активации.",
    alertSuccessTitle: "Успешно",
    alertSuccessMessage: "Приложение успешно активировано!",
    alertKeyUsed: "Этот ключ уже закреплен за другим устройством!",
    alertKeyBlock: "Этот ключ заблокирован администратором.",
    alertKeyNotFound: "Ключ не найден в базе данных.",
    alertInputError: "Введите корректные числа",
    alertPdfError: "Не удалось создать PDF",
    alertRequestSaved: "Данные записаны в базу. На вашем устройстве не найдено настроенное приложение почты для прямой отправки.",
    alertMailError: "Запрос успешно сохранен в Firebase, но не удалось запустить почтовое приложение.",
    alertFillFields: "Пожалуйста, заполните Имя и Телефон для связи",
    btnToday: "Сегодня",
    noRecordsText: "Нет записей за этот день",
    subSectionTitle: "Работы за день:",
    dayTotalText: "Всего за день:",
    btnAddRecord: "+ Добавить запись",
    selectLangTitle: "Выберите язык (Рус)",
    errorTitle: "Ошибка",
    networkErrorTitle: "Ошибка сети",
    networkErrorMsg: "Не удалось обновить данные из базы",
    activationErrorTitle: "Ошибка активации",
    lockTitle: "Блокировка",
    noticeTitle: "Уведомление",
    networkSendError: "Не удалось отправить данные",
    hourUnit: "ч."
  },
  uk: {
    locale: 'uk-UA',
    trialExpiredTitle: "Термін дії пробного періоду (7 днів) закінчився",
    requestFullVersion: "Надіслати запит на повну версію:",
    requestFullVersionHeader: "Запитувати повну версію",
    placeholderName: "Ваше Ім'я",
    placeholderPhone: "Телефон",
    btnSendRequest: "Надіслати запит",
    noticeText: "Введіть Ваше ім'я та телефон. Очікуйте, Вам зателефонують.",
    enterKeyTitle: "Ввести ключ активації:",
    placeholderKey: "Ключ активації (постійний)",
    btnActivate: "Актувати",
    btnExit: "Вихід",
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    statsWorkDays: "Робочих днів",
    statsWeekendDays: "Вихідних днів",
    statsTotalSum: "Сума",
    btnArchive: "Архів",
    btnSavePdf: "Зберегти PDF",
    modalDayTitle: "День",
    placeholderRate: "Ставка",
    placeholderHours: "Години",
    btnSave: "Зберегти",
    btnCancel: "Скасувати",
    btnClose: "Закрити",
    archiveEarnings: "Заробіток",
    toastTrialActive: "⏱ АКТИВНИЙ ТЕСТОВИЙ ПЕРИОД (ЗАЛИШИЛОСЯ {days} ДН.)",
    pdfTitle: "Звіт — {month}",
    pdfStatusWork: "Робочий",
    pdfStatusWeekend: "Вихідний",
    pdfColDay: "День",
    pdfColStatus: "Статус",
    pdfColRate: "Ставка",
    pdfColHours: "Години",
    pdfColSum: "Сума",
    alertExitTitle: "Вихід",
    alertExitMessage: "Вийти з профілю?",
    alertExitCancel: "Скасувати",
    alertFormatError: "Неправильний формат",
    alertFormatShort: "Занадто короткий ключ активації.",
    alertSuccessTitle: "Успішно",
    alertSuccessMessage: "Додаток успешно активовано!",
    alertKeyUsed: "Цей ключ вже закріплений за іншим пристроєм!",
    alertKeyBlock: "Цей ключ заблокований адміністратором.",
    alertKeyNotFound: "Ключ не знайдено в базі даних.",
    alertInputError: "Введіть коректні числа",
    alertPdfError: "Не вдалося створити PDF",
    alertRequestSaved: "Дані записані в базу. На вашому пристрої не знайдено налаштованого поштового додатка для прямої відправки.",
    alertMailError: "Запит успішно збережено в Firebase, но не вдалося запустити поштовий додаток.",
    alertFillFields: "Будь ласка, заповніть Ім'я та Телефон для зв'язку",
    btnToday: "Сьогодні",
    noRecordsText: "Немає записів за цей день",
    subSectionTitle: "Роботи за день:",
    dayTotalText: "Всього за день:",
    btnAddRecord: "+ Додати запис",
    selectLangTitle: "Оберіть мову (Укр)",
    errorTitle: "Помилка",
    networkErrorTitle: "Помилка мережі",
    networkErrorMsg: "Не вдалося оновити дані з бази",
    activationErrorTitle: "Помилка активації",
    lockTitle: "Блокування",
    noticeTitle: "Сповіщення",
    networkSendError: "Не вдалося надіслати дані",
    hourUnit: "год."
  }
};

export default function App() {
  const [lang, setLang] = useState(null);
  const [langModalVisible, setLangModalVisible] = useState(false);

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

  const [trialNotice, setTrialNotice] = useState(false); 
  const [isTrialExpired, setIsTrialExpired] = useState(false); 
  const [daysLeft, setDaysLeft] = useState(7);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+38 (');

  const t = translations[lang || 'ru'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    initLanguageAndAuth();
    return () => clearInterval(timer);
  }, []);

  const initLanguageAndAuth = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@tabulka_lang');
      if (savedLang === 'ru' || savedLang === 'uk') {
        setLang(savedLang);
      } else {
        setLangModalVisible(true);
      }
    } catch (e) {
      setLang('ru');
    }
    checkSavedPassword();
  };

  const handleSelectLanguage = async (selectedLang) => {
    try {
      await AsyncStorage.setItem('@tabulka_lang', selectedLang);
      setLang(selectedLang);
      setLangModalVisible(false);
    } catch (e) {
      Alert.alert(translations[selectedLang || 'ru'].errorTitle, "Error saving language");
    }
  };

  const fetchWorkData = async (currentPassword) => {
    if (!currentPassword) return;
    setIsLoadingData(true);
    try {
      const viewYear = currentMonth.getFullYear();
      const viewMonth = currentMonth.getMonth();
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${currentPassword}/${viewYear}_${viewMonth}.json`);
      const data = await response.json();
      
      if (data) {
        const normalized = {};
        Object.keys(data).forEach(dateKey => {
          const dayContent = data[dateKey];
          if (dayContent && typeof dayContent === 'object' && dayContent.records) {
            normalized[dateKey] = dayContent;
          } else if (dayContent && (dayContent.rate || dayContent.hours)) {
            normalized[dateKey] = {
              records: [{
                id: 'legacy_' + Date.now() + '_' + Math.random(),
                rate: parseFloat(dayContent.rate) || 0,
                hours: parseFloat(dayContent.hours) || 0
              }]
            };
          } else {
            normalized[dateKey] = { records: [] };
          }
        });
        setWorkData(normalized);
      } else {
        setWorkData({});
      }
    } catch (error) {
      Alert.alert(t.networkErrorTitle, t.networkErrorMsg);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (password) {
      fetchWorkData(password);
    } else {
      setWorkData({});
    }
  }, [password, currentMonth]);

  const checkSavedPassword = async () => {
    try {
      const deviceId = Application.androidId || "DEVICE_GENERIC";
      const savedPass = await AsyncStorage.getItem('@tabulka_password');
      
      if (savedPass) {
        const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${savedPass}.json`);
        const keyData = await response.json();
        
        if (keyData) {
          if (keyData.status === "used" && keyData.deviceId === deviceId) {
            setPassword(savedPass);
            setIsAuthChecking(false);
            return; 
          }
        }
      }

      const trialResponse = await fetch(`${FIREBASE_REST_URL}/trial_devices/${deviceId}.json`);
      const trialData = await trialResponse.json();
      const currentTimeSeconds = Math.floor(Date.now() / 1000);

      if (trialData) {
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
        await fetch(`${FIREBASE_REST_URL}/trial_devices/${deviceId}.json`, {
          method: 'PUT',
          body: JSON.stringify({ startedAt: currentTimeSeconds, deviceId: deviceId })
        });
        setDaysLeft(7);
        setPassword("TRIAL_MODE_" + deviceId);
        setTrialNotice(true);
        setTimeout(() => setTrialNotice(false), 3000);
      }

    } catch (e) {
      Alert.alert(t.errorTitle, "Auth check failed");
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleLogin = async () => {
    const trimmed = inputPassword.trim();
    if (trimmed.length < 3) {
      Alert.alert(t.alertFormatError, t.alertFormatShort);
      return;
    }

    setIsAuthChecking(true);

    try {
      const deviceId = Application.androidId || "DEVICE_GENERIC"; 
      const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`);
      const keyData = await response.json();
      
      if (keyData) {
        const currentStatus = keyData.status || "free";
        const currentDeviceId = keyData.deviceId || "";

        if (currentStatus === "free" && currentDeviceId === "") {
          await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status: "used", deviceId: deviceId })
          });
          await fetch(`${FIREBASE_REST_URL}/support_requests/${deviceId}.json`, { method: 'DELETE' });

          await AsyncStorage.setItem('@tabulka_password', trimmed);
          setIsTrialExpired(false); 
          setPassword(trimmed);
          setInputPassword('');
          Alert.alert(t.alertSuccessTitle, t.alertSuccessMessage);
        } else if (currentStatus === "used") {
          if (currentDeviceId && currentDeviceId === deviceId) {
            await fetch(`${FIREBASE_REST_URL}/support_requests/${deviceId}.json`, { method: 'DELETE' });
            await AsyncStorage.setItem('@tabulka_password', trimmed);
            setIsTrialExpired(false);
            setPassword(trimmed);
            setInputPassword('');
          } else {
            Alert.alert(t.activationErrorTitle, t.alertKeyUsed);
          }
        } else {
          Alert.alert(t.lockTitle, t.alertKeyBlock);
        }
      } else {
        Alert.alert(t.noticeTitle, t.alertKeyNotFound);
      }
    } catch (e) {
      Alert.alert(t.networkErrorTitle, "Database connection failed");
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleSendSupportRequest = async () => {
    if (!clientName.trim() || clientPhone.trim() === '+38 (' || clientPhone.trim().length < 8) {
      Alert.alert(t.errorTitle, t.alertFillFields);
      return;
    }

    try {
      const deviceId = Application.androidId || "DEVICE_GENERIC";
      await fetch(`${FIREBASE_REST_URL}/support_requests/${deviceId}.json`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName.trim(),
          phone: clientPhone.trim(),
          deviceId: deviceId,
          createdAt: Math.floor(Date.now() / 1000)
        })
      });

      const subject = encodeURIComponent("Запрос ключа активации Tabulka");
      const body = encodeURIComponent(`Данные запроса:\n\nИмя: ${clientName.trim()}\nТелефон: ${clientPhone.trim()}\nID устройства: ${deviceId}`);
      const mailtoUrl = `mailto:${MY_TARGET_EMAIL}?subject=${subject}&body=${body}`;

      setRequestModalVisible(false);

      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(t.alertSuccessTitle, t.alertRequestSaved);
      }
    } catch (e) {
      setRequestModalVisible(false);
      Alert.alert(t.noticeTitle, t.alertMailError);
    }
  };

  const handleLogout = () => {
    Alert.alert(t.alertExitTitle, t.alertExitMessage, [
      { text: t.alertExitCancel, style: "cancel" },
      { 
        text: t.btnExit, 
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

  const getDayTotal = (dayData) => {
    if (!dayData || !dayData.records) return 0;
    return dayData.records.reduce((sum, rec) => sum + (rec.rate * rec.hours), 0);
  };

  const getDayHours = (dayData) => {
    if (!dayData || !dayData.records) return 0;
    return dayData.records.reduce((sum, rec) => sum + rec.hours, 0);
  };

  const handleDayPress = (dateStr) => {
    setSelectedDate(dateStr);
    setRate('');
    setHours('');
    setModalVisible(true);
  };

  const handleAddRecord = () => {
    const numRate = parseFloat(rate);
    const numHours = parseFloat(hours);

    if (!rate || !hours || isNaN(numRate) || isNaN(numHours) || numRate <= 0 || numHours <= 0) {
      Alert.alert(t.errorTitle, t.alertInputError);
      return;
    }

    const currentDayData = workData[selectedDate] || { records: [] };
    const newRecord = {
      id: Date.now().toString() + '_' + Math.random(),
      rate: numRate,
      hours: numHours
    };

    const updatedDayData = {
      ...currentDayData,
      records: [...(currentDayData.records || []), newRecord]
    };

    setWorkData({
      ...workData,
      [selectedDate]: updatedDayData
    });

    setRate('');
    setHours('');
  };

  const handleDeleteRecord = (recordId) => {
    const currentDayData = workData[selectedDate];
    if (!currentDayData || !currentDayData.records) return;

    const updatedRecords = currentDayData.records.filter(rec => rec.id !== recordId);
    
    setWorkData({
      ...workData,
      [selectedDate]: { ...currentDayData, records: updatedRecords }
    });
  };

  const saveDayAndClose = async () => {
    if (!selectedDate) return;
    const viewYear = currentMonth.getFullYear();
    const viewMonth = currentMonth.getMonth();
    const dayDataToSave = workData[selectedDate] || { records: [] };

    try {
      if (dayDataToSave.records.length === 0) {
        await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${viewYear}_${viewMonth}/${selectedDate}.json`, {
          method: 'DELETE'
        });
      } else {
        await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${viewYear}_${viewMonth}/${selectedDate}.json`, {
          method: 'PUT',
          body: JSON.stringify(dayDataToSave)
        });
      }
      setModalVisible(false);
      setSelectedDate(null);
      fetchWorkData(password);
    } catch (e) {
      Alert.alert(t.networkErrorTitle, t.networkSendError);
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

  const calculateStatsForPeriod = (daysList) => {
    let wDays = 0; 
    let wkDays = 0; 
    let tSum = 0;
    
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    
    const activeWorkDaysInMonth = daysList.filter(day => workData[day] && getDayTotal(workData[day]) > 0);
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
      const dayTotal = getDayTotal(workData[day]);
      if (dayTotal > 0) { 
        wDays++; 
        tSum += dayTotal; 
      } else { 
        if (dayNum >= firstWorkDayNum && dayNum <= lastWorkDayNum) {
          wkDays++; 
        }
      }
    });
    
    return { workDays: wDays, weekendDays: wkDays, totalSum: tSum };
  };

  const stats = calculateStatsForPeriod(getDaysInMonth(currentMonth));

  const getArchiveMonthsList = () => {
    const list = [];
    const today = new Date();
    for (let i = 1; i <= 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        dateObject: d
      });
    }
    return list;
  };

  const loadArchiveMonthData = (year, month) => {
    setCurrentMonth(new Date(year, month, 1));
    setArchiveModalVisible(false);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const monthStr = currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' });
    let tableRows = '';
    
    days.forEach(day => {
      const data = workData[day];
      const dayNum = day.split('-')[2];
      const totalSum = getDayTotal(data);
      const totalHours = getDayHours(data);

      if (totalSum > 0) {
        tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWork}</td><td>-</td><td>${totalHours}</td><td>${totalSum}</td></tr>`;
      } else {
        tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWeekend}</td><td>-</td><td>-</td><td>-</td></tr>`;
      }
    });

    const formattedTitle = t.pdfTitle.replace('{month}', monthStr);
    const htmlContent = `<html><head><style>body{font-family:'Helvetica';padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}</style></head><body><h1>${formattedTitle}</h1><table><tr><th>${t.pdfColDay}</th><th>${t.pdfColStatus}</th><th>${t.pdfColRate}</th><th>${t.pdfColHours}</th><th>${t.pdfColSum}</th></tr>${tableRows}</table></body></html>`;
    
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert(t.errorTitle, t.alertPdfError);
    }
  };

  const renderCalendarGrid = () => {
    const days = getDaysInMonth(currentMonth);
    if (days.length === 0) return null;

    const firstDayDate = new Date(days[0]);
    let startOfWeekOffset = firstDayDate.getDay(); 
    startOfWeekOffset = startOfWeekOffset === 0 ? 6 : startOfWeekOffset - 1;

    const gridCells = [];
    for (let i = 0; i < startOfWeekOffset; i++) {
      gridCells.push(<View key={`empty-${i}`} style={styles.emptyCell} />);
    }

    days.forEach((dateStr) => {
      const dayData = workData[dateStr];
      const dayTotal = getDayTotal(dayData);
      const isWorkDay = dayTotal > 0;
      const dayNum = dateStr.split('-')[2];
      
      gridCells.push(
        <TouchableOpacity 
          key={dateStr} 
          style={isWorkDay ? styles.workDayCell : styles.weekendCell} 
          onPress={() => handleDayPress(dateStr)}
        >
          <Text style={isWorkDay ? styles.workDayText : styles.dayText}>
            {parseInt(dayNum, 10)}
          </Text>
          {isWorkDay && (
            <Text style={styles.cellSumSubtext}>{dayTotal}</Text>
          )}
        </TouchableOpacity>
      );
    });

    const rows = [];
    for (let i = 0; i < gridCells.length; i += 7) {
      rows.push(
        <View key={`row-${i}`} style={styles.calendarRow}>
          {gridCells.slice(i, i + 7)}
        </View>
      );
    }
    return rows;
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
        <View style={styles.authCardExpired}>
          <Text style={styles.authTitleExpired}>{t.trialExpiredTitle}</Text>
          
          <Text style={styles.authSubtitleBold}>{t.requestFullVersion}</Text>
          <TextInput placeholder={t.placeholderName} style={styles.authInputMargin} value={clientName} onChangeText={setClientName} />
          <TextInput placeholder={t.placeholderPhone} keyboardType="phone-pad" style={styles.authInputMarginLarge} value={clientPhone} onChangeText={setClientPhone} />
          
          <TouchableOpacity style={styles.authBtnSend} onPress={handleSendSupportRequest}>
            <Text style={styles.authButtonText}>{t.btnSendRequest}</Text>
          </TouchableOpacity>
          
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeSubText}>{t.noticeText}</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.authSubtitleBold}>{t.enterKeyTitle}</Text>
          <TextInput
            placeholder={t.placeholderKey}
            autoCapitalize="characters"
            style={styles.authInput}
            value={inputPassword}
            onChangeText={setInputPassword}
          />
          <TouchableOpacity style={styles.authBtnActivate} onPress={handleLogin}>
            <Text style={styles.authButtonText}>{t.btnActivate}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentModeTrial = password && password.startsWith("TRIAL_MODE_");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* ВСПЛЫВАЮЩИЙ ТРИАЛ ТОАСТ НА 3 СЕКУНДЫ */}
        {trialNotice && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>
              {t.toastTrialActive.replace('{days}', daysLeft)}
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.headerTimeBlock}>
            <Text style={styles.dateText}>{currentTime.toLocaleDateString(t.locale)}</Text>
            <Text style={styles.timeText}>{currentTime.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          
          {isCurrentModeTrial ? (
            <TouchableOpacity style={styles.requestHeaderButton} onPress={() => setRequestModalVisible(true)}>
              <Text style={styles.requestHeaderButtonText}>{t.requestFullVersionHeader}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t.btnExit}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthSelectorRow}>
          <TouchableOpacity 
            style={lang === 'ru' ? styles.langCircleRu : styles.langCircleRuDimmed} 
            onPress={() => handleSelectLanguage('ru')}
          >
            <Text style={styles.langCircleText}>Р</Text>
          </TouchableOpacity>

          <View style={styles.monthTitleWrapper}>
            <Text style={styles.monthTitle}>
              {currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' }).toUpperCase()}
            </Text>
            <TouchableOpacity style={styles.todayButton} onPress={handleGoToToday}>
              <Text style={styles.todayButtonText}>{t.btnToday.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={lang === 'uk' ? styles.langCircleUk : styles.langCircleUkDimmed} 
            onPress={() => handleSelectLanguage('uk')}
          >
            <Text style={styles.langCircleText}>У</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {t.weekDays.map((day, index) => {
            const isWeekend = day === 'Сб' || day === 'Вс' || day === 'Нд';
            return (
              <Text key={index} style={isWeekend ? styles.weekDayTextWeekend : styles.weekDayTextNormal}>
                {day}
              </Text>
            );
          })}
        </View>

        {isLoadingData ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0052CC" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.calendarGrid}>
            {renderCalendarGrid()}
          </ScrollView>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{t.statsWorkDays}: {stats.workDays}</Text>
          <Text style={styles.statsText}>{t.statsWeekendDays}: {stats.weekendDays}</Text>
          <Text style={styles.totalText}>{t.statsTotalSum}: {stats.totalSum}</Text>
        </View>

        <TouchableOpacity style={styles.archiveButton} onPress={() => setArchiveModalVisible(true)}>
          <Text style={styles.archiveButtonText}>{t.btnArchive}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}>
          <Text style={styles.pdfButtonText}>{t.btnSavePdf}</Text>
        </TouchableOpacity>

        <Modal visible={langModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentLang}>
              <TouchableOpacity style={styles.btnLangUk} onPress={() => handleSelectLanguage('uk')}>
                <Text style={styles.authButtonText}>Оберіть мову (Укр)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnLangRu} onPress={() => handleSelectLanguage('ru')}>
                <Text style={styles.authButtonText}>Выберите язык (Рус)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={requestModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.btnSendRequest}</Text>
              <TextInput placeholder={t.placeholderName} style={styles.input} value={clientName} onChangeText={setClientName} />
              <TextInput placeholder={t.placeholderPhone} keyboardType="phone-pad" style={styles.input} value={clientPhone} onChangeText={setClientPhone} />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.btnRequestSave} onPress={handleSendSupportRequest}>
                  <Text style={styles.btnText}>{t.btnSendRequest}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setRequestModalVisible(false)}>
                  <Text style={styles.btnText}>{t.btnCancel}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.noticeContainerMargin}>
                <Text style={styles.noticeSubText}>{t.noticeText}</Text>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={archiveModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.btnArchive}</Text>
              <ScrollView style={styles.archiveScroll}>
                {getArchiveMonthsList().map((item, idx) => {
                  const label = item.dateObject.toLocaleString(t.locale, { month: 'long', year: 'numeric' });
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.archiveItemRow}
                      onPress={() => loadArchiveMonthData(item.year, item.month)}
                    >
                      <Text style={styles.archiveMonthNameText}>{label.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.btnCloseArchive} onPress={() => setArchiveModalVisible(false)}>
                <Text style={styles.btnText}>{t.btnClose}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.modalDayTitle}: {selectedDate ? selectedDate.split('-')[2] : ''}</Text>
              
              <Text style={styles.subSectionTitle}>{t.subSectionTitle}</Text>
              <ScrollView style={styles.miniRecordsList}>
                {workData[selectedDate]?.records && workData[selectedDate].records.length > 0 ? (
                  workData[selectedDate].records.map((rec) => (
                    <View key={rec.id} style={styles.miniRecordRow}>
                      <Text style={styles.miniRecordText}>
                        {rec.rate} × {rec.hours} {t.hourUnit} = {rec.rate * rec.hours}
                      </Text>
                      <TouchableOpacity onPress={() => handleDeleteRecord(rec.id)} style={styles.miniDeleteBtn}>
                        <Text style={styles.miniDeleteBtnText}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRecordsText}>{t.noRecordsText}</Text>
                )}
              </ScrollView>

              <View style={styles.dayTotalContainer}>
                <Text style={styles.dayTotalText}>{t.dayTotalText} {getDayTotal(workData[selectedDate])}</Text>
              </View>

              <View style={styles.inputGroupRow}>
                <TextInput 
                  placeholder={t.placeholderRate} 
                  keyboardType="numeric" 
                  style={[styles.inputInline, { marginRight: 8 }]} 
                  value={rate} 
                  onChangeText={setRate} 
                />
                <TextInput 
                  placeholder={t.placeholderHours} 
                  keyboardType="numeric" 
                  style={styles.inputInline} 
                  value={hours} 
                  onChangeText={setHours} 
                />
              </View>

              <TouchableOpacity style={styles.btnAddRecordRow} onPress={handleAddRecord}>
                <Text style={styles.btnAddRecordRowText}>{t.btnAddRecord}</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.btnSave} onPress={saveDayAndClose}>
                  <Text style={styles.btnText}>{t.btnSave}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => { setModalVisible(false); setSelectedDate(null); fetchWorkData(password); }}>
                  <Text style={styles.btnText}>{t.btnCancel}</Text>
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
  safeArea: { flex: 1, backgroundColor: '#F4F5F7' },
  container: { flex: 1, paddingHorizontal: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  
  // КРАСИВЫЙ ТОАСТ ДЛЯ АКТИВНОГО ТРИАЛА
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '900', textAlign: 'center' },

  header: { flexDirection: 'row', justifyContent: 'between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E3E6EB' },
  headerTimeBlock: { flex: 1 },
  dateText: { fontSize: 14, color: '#6B778C', fontWeight: 'bold' },
  timeText: { fontSize: 20, color: '#172B4D', fontWeight: '900' },
  logoutButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFEBE6', borderRadius: 6 },
  logoutText: { color: '#DE350B', fontWeight: 'bold', fontSize: 13 },
  requestHeaderButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#EAE6FF', borderRadius: 6, marginRight: 8 },
  requestHeaderButtonText: { color: '#403294', fontWeight: 'bold', fontSize: 12 },
  
  monthSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  monthTitleWrapper: { alignItems: 'center', flex: 1 },
  monthTitle: { fontSize: 16, color: '#0052CC', fontWeight: '900', letterSpacing: 0.5 },
  todayButton: { marginTop: 2, paddingHorizontal: 8, paddingVertical: 2 },
  todayButtonText: { fontSize: 10, color: '#0052CC', fontWeight: '900' },
  
  langCircleRu: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0052CC', justifyContent: 'center', alignItems: 'center' },
  langCircleRuDimmed: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DFE1E6', justifyContent: 'center', alignItems: 'center' },
  langCircleUk: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFAB00', justifyContent: 'center', alignItems: 'center' },
  langCircleUkDimmed: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DFE1E6', justifyContent: 'center', alignItems: 'center' },
  langCircleText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  
  weekDaysRow: { flexDirection: 'row', backgroundColor: '#EBECF0', paddingVertical: 6, borderRadius: 6, marginBottom: 4 },
  weekDayTextNormal: { width: (width - 24) / 7, textAlign: 'center', fontSize: 12, color: '#172B4D', fontWeight: 'bold' },
  weekDayTextWeekend: { width: (width - 24) / 7, textAlign: 'center', fontSize: 12, color: '#DE350B', fontWeight: 'bold' },
  
  calendarGrid: { paddingBottom: 10 },
  calendarRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 4 },
  emptyCell: { width: (width - 24) / 7, height: 48 },
  weekendCell: { width: (width - 24) / 7, height: 48, backgroundColor: '#FFF', borderWidth: 0.5, borderColor: '#DCE0E5', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  workDayCell: { width: (width - 24) / 7, height: 48, backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#90CAF9', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  dayText: { fontSize: 14, color: '#172B4D', fontWeight: 'bold' },
  workDayText: { fontSize: 14, color: '#0D47A1', fontWeight: '900' },
  cellSumSubtext: { fontSize: 9, color: '#1565C0', marginTop: 1, fontWeight: '900', textAlign: 'center' },
  
  statsContainer: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E3E6EB', marginVertical: 8 },
  statsText: { fontSize: 13, color: '#172B4D', marginBottom: 3, fontWeight: 'bold' },
  totalText: { fontSize: 15, color: '#006644', fontWeight: '900', marginTop: 2, borderTopWidth: 0.5, borderTopColor: '#DDD', paddingTop: 4 },
  
  archiveButton: { backgroundColor: '#505F79', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginBottom: 6 },
  archiveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  pdfButton: { backgroundColor: '#0052CC', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  pdfButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(9, 30, 66, 0.54)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.88, backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 8 },
  modalContentLang: { width: width * 0.82, backgroundColor: '#FFF', borderRadius: 12, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 16, color: '#172B4D', fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  
  subSectionTitle: { fontSize: 12, color: '#6B778C', fontWeight: 'bold', marginBottom: 4 },
  miniRecordsList: { maxHeight: 100, minHeight: 30, backgroundColor: '#F4F5F7', borderRadius: 6, padding: 6, marginBottom: 8 },
  miniRecordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#DFE1E6' },
  miniRecordText: { fontSize: 12, color: '#172B4D', fontWeight: 'bold' },
  miniDeleteBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  miniDeleteBtnText: { fontSize: 14, color: '#DE350B' },
  noRecordsText: { fontSize: 12, color: '#A5ADBA', italic: true, textAlign: 'center', marginTop: 6 },
  dayTotalContainer: { alignItems: 'flex-end', marginBottom: 8, paddingRight: 4 },
  dayTotalText: { fontSize: 13, color: '#006644', fontWeight: '900' },
  
  inputGroupRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  inputInline: { flex: 1, backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#DFE1E6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: '#172B4D' },
  btnAddRecordRow: { backgroundColor: '#FFAB00', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  btnAddRecordRowText: { color: '#172B4D', fontWeight: '900', fontSize: 13 },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btnSave: { flex: 1, backgroundColor: '#0052CC', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  btnRequestSave: { flex: 1, backgroundColor: '#006644', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  btnCancel: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#42526E', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnText: { fontWeight: 'bold', fontSize: 14, color: '#42526E' },
  btnSaveText: { color: '#FFF' },
  
  btnCloseArchive: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#A5ADBA', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  archiveScroll: { maxHeight: 220, marginVertical: 4 },
  archiveItemRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDEDED', alignItems: 'center' },
  archiveMonthNameText: { fontSize: 13, color: '#172B4D', fontWeight: '900' },
  
  btnLangUk: { width: '100%', backgroundColor: '#FFAB00', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  btnLangRu: { width: '100%', backgroundColor: '#0052CC', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  
  authContainer: { flex: 1, backgroundColor: '#97A0AF', justifyContent: 'center', alignItems: 'center' },
  authCardExpired: { width: width * 0.9, backgroundColor: '#FFF', borderRadius: 12, padding: 18, shadowColor: '#000', shadowRadius: 6, elevation: 8 },
  authTitleExpired: { fontSize: 15, color: '#DE350B', fontWeight: '900', textAlign: 'center', marginBottom: 14 },
  authSubtitleBold: { fontSize: 13, color: '#172B4D', fontWeight: '900', marginBottom: 6 },
  authInputMargin: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#DFE1E6', borderRadius: 6, padding: 8, fontSize: 14, marginBottom: 8 },
  authInputMarginLarge: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#DFE1E6', borderRadius: 6, padding: 8, fontSize: 14, marginBottom: 12 },
  authInput: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#DFE1E6', borderRadius: 6, padding: 8, fontSize: 14, marginBottom: 10 },
  authBtnSend: { backgroundColor: '#006644', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginBottom: 6 },
  authBtnActivate: { backgroundColor: '#0052CC', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  authButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  separator: { height: 1, backgroundColor: '#DFE1E6', my: 14, marginVertical: 14 },
  noticeContainer: { paddingHorizontal: 4, marginTop: 4 },
  noticeContainerMargin: { paddingHorizontal: 4, marginTop: 12 },
  noticeSubText: { fontSize: 11, color: '#6B778C', textAlign: 'center', lineHeight: 14, fontWeight: 'bold' },
  input: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#DFE1E6', borderRadius: 6, padding: 10, fontSize: 14, marginBottom: 10, color: '#172B4D' }
});
