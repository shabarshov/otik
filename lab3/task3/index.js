class ArchiveLZ2 {
  constructor(signature = "LZ2ARC") {
      this.signature = signature;
      this.version = { major: 1, minor: 0 };  // Версия 1.0
  }

  // Метод для кодирования данных в архив
  encode(fileData, compressionCtx = 0, compressionNoCtx = 0, errorProtection = 0, auxiliaryData = []) {
      const encoder = new TextEncoder();
      const rawData = encoder.encode(fileData);  // Преобразуем строку в байты

      const fileLength = rawData.length;  // Длина исходного файла в байтах
      const serviceDataSize = auxiliaryData.length;  // Длина служебных данных

      // Создаем буфер для архива, размером 6 (сигнатура) + 2 (версия) + 1 + 1 + 1 (алгоритмы) + 8 (длина файла) + 2 (размер служебных данных) + сырые данные
      const archiveBuffer = new ArrayBuffer(6 + 2 + 1 + 1 + 1 + 8 + 2 + serviceDataSize + rawData.length);
      const view = new DataView(archiveBuffer);

      // Сигнатура
      for (let i = 0; i < 6; i++) {
          view.setUint8(i, this.signature.charCodeAt(i) || 0);
      }

      // Версия формата (мажорная и минорная часть)
      view.setUint8(6, this.version.major);
      view.setUint8(7, this.version.minor);

      // Алгоритмы сжатия и защиты
      view.setUint8(8, compressionCtx);     // Сжатие с учётом контекста
      view.setUint8(9, compressionNoCtx);   // Сжатие без учёта контекста
      view.setUint8(10, errorProtection);   // Алгоритм защиты от помех

      // Длина исходного файла
      view.setBigUint64(11, BigInt(fileLength));

      // Размер служебных данных
      view.setUint16(19, serviceDataSize);

      // Служебные данные
      for (let i = 0; i < serviceDataSize; i++) {
          view.setUint8(21 + i, auxiliaryData[i]);
      }

      // Закодированные данные (сырые данные файла)
      for (let i = 0; i < rawData.length; i++) {
          view.setUint8(21 + serviceDataSize + i, rawData[i]);
      }

      return archiveBuffer;  // Возвращаем архив в виде буфера
  }

  // Метод для декодирования архива
  decode(archiveBuffer) {
      const view = new DataView(archiveBuffer);

      // Проверка сигнатуры
      let signature = '';
      for (let i = 0; i < 6; i++) {
          signature += String.fromCharCode(view.getUint8(i));
      }

      if (signature !== this.signature) {
          throw new Error("Неверная сигнатура архива");
      }

      // Чтение версии формата
      const majorVersion = view.getUint8(6);
      const minorVersion = view.getUint8(7);
      console.log(`Версия архива: ${majorVersion}.${minorVersion}`);

      // Чтение кодов алгоритмов
      const compressionCtx = view.getUint8(8);
      const compressionNoCtx = view.getUint8(9);
      const errorProtection = view.getUint8(10);
      console.log(`Сжатие с учётом контекста: ${compressionCtx}, без учёта контекста: ${compressionNoCtx}, защита от помех: ${errorProtection}`);

      // Исходная длина файла
      const fileLength = Number(view.getBigUint64(11));

      // Размер служебных данных
      const serviceDataSize = view.getUint16(19);

      // Чтение служебных данных (если есть)
      const serviceData = new Uint8Array(serviceDataSize);
      for (let i = 0; i < serviceDataSize; i++) {
          serviceData[i] = view.getUint8(21 + i);
      }
      console.log(`Служебные данные:`, serviceData);

      // Чтение закодированных данных (оригинальных данных файла)
      const rawData = new Uint8Array(fileLength);
      for (let i = 0; i < fileLength; i++) {
          rawData[i] = view.getUint8(21 + serviceDataSize + i);
      }

      // Декодирование байтов обратно в строку
      const decoder = new TextDecoder();
      return decoder.decode(rawData);
  }
}

// Пример использования:
const archive = new ArchiveLZ2();

const fileData = "Пример текста для архивации.";  // Данные для архивации
const auxiliaryData = [1, 2, 3, 4, 5];  // Пример служебных данных (массив частот или другие параметры)

// Кодирование данных в архив
const archiveBuffer = archive.encode(fileData, 1, 0, 0, auxiliaryData);  // Сжатие с учётом контекста (1), без учёта контекста (0), защита (0)
console.log("Архив создан.", archiveBuffer);

// Декодирование данных из архива
try {
  const decodedData = archive.decode(archiveBuffer);
  console.log("Файл восстановлен:", decodedData);
} catch (error) {
  console.error(error.message);
}
