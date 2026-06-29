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

// Словарь локализации приложения
const translations = {
  ru: {
    trialExpiredTitle: "Срок пробного тестирования (7 дней) окончен",
    requestFullVersion: "Запросить полную версию:",
    placeholderName: "Ваше Имя",
    placeholderPhone: "Телефон",
    btnSendRequest: "Отправить запрос",
    noticeText: "Введите Ваше имя и телефон. Ожидайте, Вам перезвонят.",
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
    alertKeyNotFound: "Ключ не найден в папке activation_keys базы данных.",
    alertInputError: "Введите корректные числа",
    alertPdfError: "Немерно создать PDF",
    alertRequestSaved: "Данные записаны в базу. На вашем устройстве не найдено настроенное приложение почты для прямой отправки.",
    alertMailError: "Запрос успешно сохранен в Firebase, но не удалось запустить почтовое приложение.",
    alertFillFields: "Пожалуйста, заполните Имя и Телефон для связи"
  },
  uk: {
    trialExpiredTitle: "Термін пробного тестування (7 днів) закінчився",
    requestFullVersion: "Запросити повну версію:",
    placeholderName: "Ваше Ім'я",
    placeholderPhone: "Телефон",
    btnSendRequest: "Надіслати запит",
    noticeText: "Введіть Ваше ім'я та телефон. Очікуйте, Вам зателефонують.",
    enterKeyTitle: "Ввести постійний ключ:",
    placeholderKey: "Постійний ключ активації",
    btnActivate: "Активувати",
    btnExit: "Вихід",
    weekDays: ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
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
    toastTrialActive: "⏱ АКТИВНИЙ ТЕСТОВИЙ ПЕРІОД (ЗАЛИШИЛОСЯ {days} ДН.)",
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
    alertFormatError: "Невірний формат",
    alertFormatShort: "Занадто короткий ключ активації.",
    alertSuccessTitle: "Успішно",
    alertSuccessMessage: "Додаток успешно активовано!",
    alertKeyUsed: "Цей ключ вже закріплений за іншим пристроєм!",
    alertKeyBlock: "Цей ключ заблокований адміністратором.",
    alertKeyNotFound: "Ключ не знайдено в папці activation_keys базы даних.",
    alertInputError: "Введіть коректні числа",
    alertPdfError: "Не вдалося створити PDF",
    alertRequestSaved: "Дані записані в базу. На вашому пристрої не знайдено налаштованого поштового додатка для прямої відправки.",
    alertMailError: "Запит успішно збережено в Firebase, но не вдалося запустити поштовий додаток.",
    alertFillFields: "Будь ласка, заповніть Ім'я та Телефон для зв'язку"
  }
};

export default function App() {
  const [lang, setLang] = useState(null); // Текущий язык ('ru' или 'uk')
  const [langModalVisible, setLangModalVisible] = useState(false); // Модалка первого выбора

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

  // Хелпер получения текстов текущего языка (с бэкапом на русский)
  const t = translations[lang || 'ru'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    initLanguageAndAuth();
    return () => clearInterval(timer);
  }, []);

  // Инициализация языка и последующая проверка авторизации
  const initLanguageAndAuth = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@tabulka_lang');
      if (savedLang === 'ru' || savedLang === 'uk') {
        setLang(savedLang);
      } else {
        // Если язык не выбран, покажем окно выбора перед проверкой триала
        setLangModalVisible(true);
      }
    } catch (e) {
      setLang('ru');
    }
    checkSavedPassword();
  };

  // Выбор языка пользователем из приветственного окна или кружочков
  const handleSelectLanguage = async (selectedLang) => {
    try {
      await AsyncStorage.setItem('@tabulka_lang', selectedLang);
      setLang(selectedLang);
      setLangModalVisible(false);
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось сохранить язык");
    }
  };

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
          setPassword(null);
        } else {
          const calculatedDays = Math.ceil(remainingSeconds / (24 * 60 * 60));
          setDaysLeft(calculatedDays);
          setPassword("TRIAL_MODE_" + deviceId);
          setTrialNotice(true);
          setTimeout(() => setTrialNotice(false), 3000);
        }
        return; 
      }

      // Этот блок сработает только один раз для абсолютно нового устройства
      const trialRef = ref(db, `trial_devices/${deviceId}`);
      await set(trialRef, {
        startedAt: currentTimeSeconds,
        deviceId: deviceId
      });
      setDaysLeft(7);
      setPassword("TRIAL_MODE_" + deviceId);
      setTrialNotice(true);
      setTimeout(() => setTrialNotice(false), 3000);

    } catch (e) {
      Alert.alert("Ошибка", "Не удалось проверить статус авторизации");
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
          Alert.alert(t.alertSuccessTitle, t.alertSuccessMessage);

        } else if (currentStatus === "used") {
          if (currentDeviceId !== "" && currentDeviceId === deviceId) {
            const requestRef = ref(db, `support_requests/${deviceId}`);
            await remove(requestRef);

            await AsyncStorage.setItem('@tabulka_password', trimmed);
            setIsTrialExpired(false);
            setPassword(trimmed);
            setInputPassword('');
          } else {
            Alert.alert("Ошибка активации", t.alertKeyUsed);
          }
        } else {
          Alert.alert("Блокировка", t.alertKeyBlock);
        }
      } else {
        Alert.alert("Уведомление", t.alertKeyNotFound);
      }
    } catch (e) {
      Alert.alert("Ошибка Firebase", "Детали: " + e.message);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleSendSupportRequest = async () => {
    if (!clientName.trim() || clientPhone.trim() === '+38 (' || clientPhone.trim().length < 8) {
      Alert.alert("Ошибка", t.alertFillFields);
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
        Alert.alert("Запрос сохранен", t.alertRequestSaved);
      }

    } catch (e) {
      setRequestModalVisible(false);
      Alert.alert("Внимание", t.alertMailError);
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
      Alert.alert("Ошибка", t.alertInputError);
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
    const currentLangLocale = lang === 'uk' ? 'uk-UA' : 'ru-RU';
    const monthName = targetDate.toLocaleString(currentLangLocale, { month: 'long', year: 'numeric' });
    return { monthName, workDays: archiveWorkDays, totalSum: archiveTotalSum };
  };

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const currentLangLocale = lang === 'uk' ? 'uk-UA' : 'ru-RU';
    const monthStr = currentMonth.toLocaleString(currentLangLocale, { month: 'long', year: 'numeric' });
    let tableRows = '';
    days.forEach(day => {
      const data = workData[day];
      const hasData = data && (data.rate > 0 && data.hours > 0);
      const dayNum = day.split('-')[2];
      if (hasData) {
        tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWork}</td><td>${data.rate}</td><td>${data.hours}</td><td>${data.rate * data.hours}</td></tr>`;
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
      Alert.alert("Ошибка", t.alertPdfError);
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
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{t.trialExpiredTitle}</Text>
          
          <Text style={[styles.authSubtitle, { marginBottom: 10, fontWeight: 'bold' }]}>{t.requestFullVersion}</Text>
          <TextInput placeholder={t.placeholderName} style={[styles.authInput, { marginBottom: 10 }]} value={clientName} onChangeText={setClientName} />
          <TextInput placeholder={t.placeholderPhone} keyboardType="phone-pad" style={[styles.authInput, { marginBottom: 15 }]} value={clientPhone} onChangeText={setClientPhone} />
          <TouchableOpacity style={[styles.authButton, { backgroundColor: '#10B981', marginBottom: 10 }]} onPress={handleSendSupportRequest}>
            <Text style={styles.authButtonText}>{t.btnSendRequest}</Text>
          </TouchableOpacity>
          
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeSubText}>{t.noticeText}</Text>
          </View>

          <View style={{ marginVertical: 15, borderBottomWidth: 1, borderColor: '#E5E7EB' }} />

          <Text style={[styles.authSubtitle, { marginBottom: 10, fontWeight: 'bold' }]}>{t.enterKeyTitle}</Text>
          <TextInput
            placeholder={t.placeholderKey}
            autoCapitalize="characters"
            style={styles.authInput}
            value={inputPassword}
            onChangeText={setInputPassword}
          />
          <TouchableOpacity style={[styles.authButton, { backgroundColor: '#0052CC' }]} onPress={handleLogin}>
            <Text style={styles.authButtonText}>{t.btnActivate}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentModeTrial = password && password.startsWith("TRIAL_MODE_");
  const currentLangLocale = lang === 'uk' ? 'uk-UA' : 'ru-RU';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.dateText}>{currentTime.toLocaleDateString(currentLangLocale)}</Text>
            <Text style={styles.timeText}>{currentTime.toLocaleTimeString(currentLangLocale, { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          
          {isCurrentModeTrial ? (
            <TouchableOpacity style={styles.requestHeaderButton} onPress={() => setRequestModalVisible(true)}>
              <Text style={styles.requestHeaderButtonText}>{t.requestFullVersion.replace(':', '')}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t.btnExit}</Text>
          </TouchableOpacity>
        </View>

        {/* Заголовок Месяца с кнопками-кружочками по краям */}
        <View style={styles.monthSelectorRow}>
          <TouchableOpacity 
            style={[styles.langCircle, styles.langCircleRu, lang !== 'ru' && styles.langCircleDimmed]} 
            onPress={() => handleSelectLanguage('ru')}
          >
            <Text style={styles.langCircleText}>Р</Text>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleString(currentLangLocale, { month: 'long', year: 'numeric' }).toUpperCase()}
          </Text>

          <TouchableOpacity 
            style={[styles.langCircle, styles.langCircleUk, lang !== 'uk' && styles.langCircleDimmed]} 
            onPress={() => handleSelectLanguage('uk')}
          >
            <Text style={styles.langCircleText}>У</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {t.weekDays.map((day, index) => {
            const checkWeekend = day === 'Сб' || day === 'Вс' || day === 'Нд';
            return (
              <Text key={index} style={[styles.weekDayText, checkWeekend && styles.weekendText]}>
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

        {/* Модалка ручного/первого выбора языка */}
        <Modal visible={langModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingVertical: 25 }]}>
              <TouchableOpacity 
                style={[styles.authButton, { backgroundColor: '#10B981', marginBottom: 15, width: '100%' }]} 
                onPress={() => handleSelectLanguage('uk')}
              >
                <Text style={styles.authButtonText}>Виберіть мову (Укр)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.authButton, { backgroundColor: '#0052CC', width: '100%' }]} 
                onPress={() => handleSelectLanguage('ru')}
              >
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
                <TouchableOpacity style={[styles.btn, styles.btnSave, { backgroundColor: '#10B981' }]} onPress={handleSendSupportRequest}>
                  <Text style={styles.btnText}>{t.btnSendRequest}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setRequestModalVisible(false)}>
                  <Text style={styles.btnText}>{t.btnCancel}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.noticeContainer, { marginTop: 12 }]}>
                <Text style={styles.noticeSubText}>{t.noticeText}</Text>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={archiveModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.btnArchive}</Text>
              <ScrollView style={{ maxHeight: 250 }}>
                {[1, 2, 3, 4].map((m) => {
                  const a = getArchiveStatsForMonth(m);
                  return (
                    <View key={m} style={styles.archiveItem}>
                      <Text style={styles.archiveMonthName}>{a.monthName}</Text>
                      <Text style={styles.archiveItemTotal}>{t.archiveEarnings}: {a.totalSum}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={[styles.btn, styles.btnCancel, { width: '100%', marginTop: 10 }]} onPress={() => setArchiveModalVisible(false)}>
                <Text style={styles.btnText}>{t.btnClose}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.modalDayTitle}: {selectedDate ? selectedDate.split('-')[2] : ''}</Text>
              <TextInput placeholder={t.placeholderRate} style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} />
              <TextInput placeholder={t.placeholderHours} style={styles.
