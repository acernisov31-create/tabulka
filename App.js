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

// Используем REST URL нашей базы данных Firebase напрямую
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
    alertKeyNotFound: "Ключ не найден в базе данных.",
    alertInputError: "Введите корректные числа",
    alertPdfError: "Не удалось создать PDF",
    alertRequestSaved: "Данные записаны в базу. На вашем устройстве не найдено настроенное приложение почты для прямой отправки.",
    alertMailError: "Запрос успешно сохранен в Firebase, но не удалось запустить почтовое приложение.",
    alertFillFields: "Пожалуйста, заполните Имя и Телефон для связи"
  },
  uk: {
    locale: 'uk-UA',
    trialExpiredTitle: "Термін пробного тестування (7 днів) закінчився",
    requestFullVersion: "Запросити повну версію:",
    requestFullVersionHeader: "Запросити повну версію",
    placeholderName: "Ваше Ім'я",
    placeholderPhone: "Телефон",
    btnSendRequest: "Надіслати запит",
    noticeText: "Введіть Ваше ім'я та телефон. Очікуйте, Вам зателефонують.",
    enterKeyTitle: "Ввести постійний ключ:",
    placeholderKey: "Постійний ключ активації",
    btnActivate: "Активирувати",
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
    alertKeyNotFound: "Ключ не знайдено в базі даних.",
    alertInputError: "Введіть коректні числа",
    alertPdfError: "Не вдалося створити PDF",
    alertRequestSaved: "Дані записані в базу. На вашому пристрої не знайдено налаштованого поштового додатка для збереження.",
    alertMailError: "Запит успішно збережено в Firebase, але не вдалося запустити поштовий додаток.",
    alertFillFields: "Будь ласка, заповніть Ім'я та Телефон для зв'язку"
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
      Alert.alert("Ошибка", "Не удалось сохранить язык");
    }
  };

  // REST-метод для получения данных календаря (заменяет onValue)
  const fetchWorkData = async (currentPassword) => {
    if (!currentPassword) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${currentPassword}.json`);
      const data = await response.json();
      setWorkData(data || {});
    } catch (error) {
      Alert.alert("Ошибка сети", "Не удалось обновить данные из базы");
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
  }, [password]);

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
            Alert.alert("Ошибка активации", t.alertKeyUsed);
          }
        } else {
          Alert.alert("Блокировка", t.alertKeyBlock);
        }
      } else {
        Alert.alert("Уведомление", t.alertKeyNotFound);
      }
    } catch (e) {
      Alert.alert("Ошибка сети", "Не удалось связаться с базой данных");
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
      await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${dateStr}.json`, {
        method: 'PUT',
        body: JSON.stringify(dayData)
      });
      // Локально обновляем стейт, чтобы сразу увидеть изменения без лишних запросов
      setWorkData(prev => {
        const updated = { ...prev };
        if (dayData === null) {
          delete updated[dateStr];
        } else {
          updated[dateStr] = dayData;
        }
        return updated;
      });
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
    let wDays = 0; 
    let wkDays = 0; 
    let tSum = 0;
    
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
        wDays++; 
        tSum += workData[day].rate * workData[day].hours; 
      } else { 
        if (dayNum >= firstWorkDayNum && dayNum <= lastWorkDayNum) {
          wkDays++; 
        }
      }
    });
    
    return { workDays: wDays, weekendDays: wkDays, totalSum: tSum };
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
    const monthName = targetDate.toLocaleString(t.locale, { month: 'long', year: 'numeric' });
    return { monthName, workDays: archiveWorkDays, totalSum: archiveTotalSum };
  };

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const monthStr = currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' });
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
      const isWorkDay = workData[dateStr] && (workData[dateStr].rate > 0 && workData[dateStr].hours > 0);
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

          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' }).toUpperCase()}
          </Text>

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
                <Text style={styles.authButtonText}>Виберіть мову (Укр)</Text>
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
              <TextInput placeholder={t.placeholderRate} style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} />
              <TextInput placeholder={t.placeholderHours} style={styles.input} keyboardType="numeric" value={hours} onChangeText={setHours} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveDay}><Text style={styles.btnText}> {t.btnSave} </Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}> {t.btnCancel} </Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {trialNotice && (
        <View style={styles.trialToastContainer} pointerEvents="none">
          <View style={styles.trialToast}>
            <Text style={styles.trialToastText}>
              {t.toastTrialActive.replace('{days}', daysLeft.toString())}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  authContainer: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  authCardExpired: { width: width * 0.9, backgroundColor: '#FFF', padding: 22, borderRadius: 16, borderWidth: 1.5, borderColor: '#EF4444' },
  authTitleExpired: { fontSize: 20, fontWeight: 'bold', color: '#EF4444', marginBottom: 15, textAlign: 'center' },
  authSubtitleBold: { fontSize: 14, color: '#4B5563', marginBottom: 8, textAlign: 'left', fontWeight: 'bold' },
  authInput: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  authInputMargin: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 10, textAlign: 'center' },
  authInputMarginLarge: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 15, textAlign: 'center' },
  authButton: { padding: 13, borderRadius: 10, alignItems: 'center' },
  authBtnSend: { padding: 13, borderRadius: 10, alignItems: 'center', backgroundColor: '#10B981', marginBottom: 10 },
  authBtnActivate: { padding: 13, borderRadius: 10, alignItems: 'center', backgroundColor: '#0052CC' },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  separator: { marginVertical: 15, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 30 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTimeBlock: { flex: 1.2 },
  dateText: { fontSize: 14, color: '#6B7280' },
  timeText: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  logoutButton: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#EF4444', borderRadius: 6 },
  logoutText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  requestHeaderButton: { flex: 1, marginHorizontal: 6, paddingVertical: 6, paddingHorizontal: 4, backgroundColor: '#10B981', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  requestHeaderButtonText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  monthSelectorRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#374151', textAlign: 'center', marginHorizontal: 10, flexShrink: 1, minWidth: 160 },
  langCircleText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  langCircleRu: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, backgroundColor: '#0052CC' },
  langCircleRuDimmed: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, backgroundColor: '#0052CC', opacity: 0.35 },
  langCircleUk: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, backgroundColor: '#10B981' },
  langCircleUkDimmed: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, backgroundColor: '#10B981', opacity: 0.35 },
  weekDaysRow: { flexDirection: 'row', marginBottom: 8 },
  weekDayTextNormal: { width: (width - 32) / 7 - 8, marginHorizontal: 4, textAlign: 'center', fontWeight: '700', color: '#9CA3AF' },
  weekDayTextWeekend: { width: (width - 32) / 7 - 8, marginHorizontal: 4, textAlign: 'center', fontWeight: '700', color: '#EF4444' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarRow: { flexDirection: 'row', justifyContent: 'flex-start', width: '100%' },
  emptyCell: { width: (width - 32) / 7 - 8, height: 42, margin: 4, borderColor: 'transparent', backgroundColor: 'transparent' },
  weekendCell: { width: (width - 32) / 7 - 8, height: 42, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: '#FFF', borderColor: '#E5E7EB' },
  workDayCell: { width: (width - 32) / 7 - 8, height: 42, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: '#0052CC', borderColor: '#0052CC' },
  dayText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  workDayText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  statsContainer: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  statsText: { fontSize: 14, color: '#4B5563' },
  totalText: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  archiveButton: { backgroundColor: '#0052CC', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  archiveButtonText: { color: '#FFF', fontWeight: 'bold' },
  pdfButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  pdfButtonText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', padding: 20, borderRadius: 16 },
  modalContentLang: { width: width * 0.85, backgroundColor: '#FFF', padding: 20, borderRadius: 16, paddingVertical: 25 },
  btnLangUk: { padding: 13, borderRadius: 10, alignItems: 'center', backgroundColor: '#10B981', marginBottom: 15, width: '100%' },
  btnLangRu: { padding: 13, borderRadius: 10, alignItems: 'center', backgroundColor: '#0052CC', width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  archiveScroll: { maxHeight: 250 },
  archiveItem: { padding: 10, backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 6 },
  archiveMonthName: { fontWeight: 'bold', color: '#0052CC' },
  archiveItemTotal: { fontWeight: 'bold' },
  btnCloseArchive: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center', backgroundColor: '#9CA3AF', width: '100%', marginTop: 10 },
  input: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  btnSave: { backgroundColor: '#0052CC', flex: 1, marginRight: 5 },
  btnRequestSave: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center', backgroundColor: '#10B981', flex: 1, marginRight: 5 },
  btnCancel: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  noticeContainer: { backgroundColor: '#0052CC', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeContainerMargin: { backgroundColor: '#0052CC', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  noticeSubText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  trialToastContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  trialToast: { backgroundColor: 'rgba(0, 0, 0, 0.88)', paddingVertical: 18, paddingHorizontal: 26, borderRadius: 14, maxWidth: width * 0.9, elevation: 8 },
  trialToastText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5 }
});
