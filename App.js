import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal
} from 'react-native';
import database from '@react-native-firebase/database';
import { Application } from 'expo-application'; // или используйте вашу текущую библиотеку для получения ID устройства

// Константа для 14 дней в секундах (14 дней * 24 часа * 60 минут * 60 секунд)
const TRIAL_DURATION_SECONDS = 14 * 24 * 60 * 60;

export default function App() {
  const [keyInput, setKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userKey, setUserKey] = useState(null);
  const [deviceId, setDeviceId] = useState('');

  // --- НОВЫЕ СОСТОЯНИЯ ДЛЯ ТЕСТОВОГО РЕЖИМА ---
  const [trialNotice, setTrialNotice] = useState(false); // Показ уведомления на 3 секунды
  const [isTrialExpired, setIsTrialExpired] = useState(false); // Блокировка экрана по истечении 14 дней

  useEffect(() => {
    getDeviceAndCheckAuth();
  }, []);

  const getDeviceAndCheckAuth = async () => {
    try {
      // Получаем уникальный ID устройства (используйте ваш текущий рабочий способ)
      const id = Application.androidId || 'DEVELOPMENT_DEVICE_ID'; 
      setDeviceId(id);
      
      // Проверяем, авторизован ли уже этот телефон в базе
      const snapshot = await database().ref('activation_keys').once('value');
      const keys = snapshot.val();
      
      if (keys) {
        let foundKey = null;
        let keyData = null;

        // Ищем, привязан ли этот deviceId к какому-либо ключу
        Object.keys(keys).forEach(k => {
          if (keys[k].deviceId === id && keys[k].status === 'used') {
            foundKey = k;
            keyData = keys[k];
          }
        });

        if (foundKey && keyData) {
          setUserKey(foundKey);
          
          // Проверка на тестовый режим для уже активированного ключа
          if (keyData.type === 'trial' && keyData.activatedAt) {
            const currentTimeSeconds = Math.floor(Date.now() / 1000);
            const timePassed = currentTimeSeconds - keyData.activatedAt;

            if (timePassed > TRIAL_DURATION_SECONDS) {
              // Если 14 дней прошло — блокируем
              setIsTrialExpired(true);
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            } else {
              // Если еще тестируется — показываем уведомление на 3 секунды
              setTrialNotice(true);
              setTimeout(() => {
                setTrialNotice(false);
              }, 3000);
            }
          }

          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.log('Ошибка проверки авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция первой активации ключа (когда пользователь вводит его руками)
  const handleActivateKey = async () => {
    if (!keyInput.trim()) {
      Alert.alert('Ошибка', 'Введите ключ активации');
      return;
    }

    setIsLoading(true);
    const cleanKey = keyInput.trim();

    try {
      const keyRef = database().ref(`activation_keys/${cleanKey}`);
      const snapshot = await keyRef.once('value');
      
      if (!snapshot.exists()) {
        Alert.alert('Ошибка', 'Такого ключа не существует');
        setIsLoading(false);
        return;
      }

      const keyData = snapshot.val();

      if (keyData.status === 'used') {
        Alert.alert('Ошибка', 'Этот ключ уже активирован на другом устройстве');
        setIsLoading(false);
        return;
      }

      // Формируем данные для обновления ключа в базе
      const updateData = {
        status: 'used',
        deviceId: deviceId
      };

      // Если ключ тестовый — записываем время активации прямо сейчас
      if (keyData.type === 'trial') {
        const activationTime = Math.floor(Date.now() / 1000); // Текущее время в секундах
        updateData.activatedAt = activationTime;
        
        // Показываем приветственное уведомление на 3 секунды
        setTrialNotice(true);
        setTimeout(() => {
          setTrialNotice(false);
        }, 3000);
      }

      // Сохраняем данные в Firebase
      await keyRef.update(updateData);
      
      setUserKey(cleanKey);
      setIsAuthenticated(true);
      Alert.alert('Успешно', 'Приложение успешно активировано!');

    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось связаться с сервером');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  // --- ЭКРАН БЛОКИРОВКИ: ТЕСТОВЫЙ ПЕРИОД ИСТЕК ---
  if (isTrialExpired) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.expiredContainer}>
          <Text style={styles.expiredTitle}>Тестирование закончилось</Text>
          <Text style={styles.expiredText}>
            Срок действия вашего тестового ключа (14 дней) исчерпан. Пожалуйста, введите постоянный ключ для продолжения работы.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Введите постоянный ключ"
            value={keyInput}
            onChangeText={setKeyInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.button} onPress={handleActivateKey}>
            <Text style={styles.buttonText}>Активировать полную версию</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- ЭКРАН ВВОДА ПЕРВОГО КЛЮЧА (ЕСЛИ ЕЩЕ НЕ АВТОРИЗОВАН) ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Активация приложения</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите ваш ключ"
            value={keyInput}
            onChangeText={setKeyInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.button} onPress={handleActivateKey}>
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- ГЛАВНЫЙ ЭКРАН ВАШЕГО ПРИЛОЖЕНИЯ (ВАШ КАЛЕНДАРЬ И ТАБЛИЦЫ) ---
  return (
    <SafeAreaView style={styles.mainContainer}>
      
      {/* Остальной ваш оригинальный экран (Календарь, Настройки, Часы и т.д.) */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Здесь отображается весь ваш рабочий интерфейс приложения</Text>
        <Text style={{ marginTop: 10, color: 'gray' }}>Ключ: {userKey}</Text>
      </View>

      {/* ВСПЛЫВАЮЩЕЕ УВЕДОМЛЕНИЕ НА 3 СЕКУНДЫ ВНИЗУ ЭКРАНА */}
      {trialNotice && (
        <View style={styles.trialToast}>
          <Text style={styles.trialToastText}>⏱ Активен тестовый период (14 дней)</Text>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expiredContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 5,
    borderColor: '#ff4d4d',
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  expiredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#ff4d4d',
    textAlign: 'center',
  },
  expiredText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  /* Стили для всплывающей плашки триала */
  trialToast: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  trialToastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
